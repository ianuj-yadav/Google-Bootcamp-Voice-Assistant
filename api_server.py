from flask import Flask, request, jsonify
from flask_cors import CORS
import urllib.request
import urllib.error
import json
import time
import sys
import traceback
from calendar_tool import book_meeting, check_availability

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

app = Flask(__name__)
CORS(app)

NVIDIA_API_KEY = "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"
# Dual-AI Perpendicular Models:
NVIDIA_MODEL_AI1 = "meta/llama-3.1-8b-instruct"   # AI #1: Real-time Listener, Intent Analyzer & Speculative Pre-Searcher
NVIDIA_MODEL_AI2 = "meta/llama-3.1-8b-instruct"   # AI #2: Executive Spoken Response Engine (Llama 3.1 8B for <400ms ultra-low latency voice sync)

# In-memory perpendicular workbench cache (AI #1 background thoughts)
perpendicular_workbench = {
    "last_speech": "",
    "cached_tool_results": {},
    "ai1_intent_summary": ""
}

@app.route('/api/book_meeting', methods=['POST'])
def handle_booking():
    data = request.json
    print(f"\n[API REQUEST] Booking {data.get('title')} at {data.get('date_time')}")
    result = book_meeting(date_time_iso=data.get('date_time'), name=data.get('guest_email'))
    print(f"[API RESPONSE] {result}")
    return jsonify({"result": result})

@app.route('/api/check_availability', methods=['POST'])
def handle_availability():
    data = request.json
    print(f"\n[API REQUEST] Checking availability for {data.get('date')}")
    result = check_availability(date_iso=data.get('date'))
    print(f"[API RESPONSE] {result}")
    return jsonify({"result": result})

# AI #1 (Perpendicular Stream Engine - Llama 3.1 8B): Runs background context & pre-search while user is speaking
@app.route('/api/stream_think', methods=['POST'])
def handle_stream_think():
    data = request.json or {}
    text = data.get("text", "").strip()
    if not text or len(text) < 4:
        return jsonify({"status": "idle"})
        
    perpendicular_workbench["last_speech"] = text
    lower_text = text.lower()
    
    # Fast speculative pre-execution if calendar terms detected
    results = {}
    today_iso = time.strftime("%Y-%m-%dT00:00:00+05:30")
    if any(k in lower_text for k in ["check", "availability", "free", "busy", "tomorrow", "today", "schedule", "calendar", "slot"]):
        try:
            res = check_availability(date_iso=today_iso)
            results["check_availability"] = res
            perpendicular_workbench["cached_tool_results"]["check_availability"] = res
        except Exception as e:
            results["check_availability"] = str(e)
            
    # Run AI #1 (meta/llama-3.1-8b-instruct) to analyze interim speech intent and prepare perpendicular thought
    start_t = time.time()
    try:
        ai1_payload = {
            "model": NVIDIA_MODEL_AI1,
            "messages": [
                {"role": "system", "content": "You are AI #1, a real-time perpendicular speech analyzer. Summarize the user's ongoing utterance into a 1-sentence semantic intent and note any entities or dates mentioned."},
                {"role": "user", "content": f"User is currently saying: \"{text}\""}
            ],
            "temperature": 0.3,
            "max_tokens": 60
        }
        req = urllib.request.Request(
            'https://integrate.api.nvidia.com/v1/chat/completions',
            data=json.dumps(ai1_payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {NVIDIA_API_KEY}',
                'Content-Type': 'application/json'
            }
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            ai1_data = json.loads(response.read().decode('utf-8'))
            ai1_thought = ai1_data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            perpendicular_workbench["ai1_intent_summary"] = ai1_thought
            print(f"[AI #1 STREAM THOUGHT] {ai1_thought}", flush=True)
    except Exception as e:
        print(f"[AI #1 STREAM THOUGHT ERROR] {e}", flush=True)
        
    latency_ms = int((time.time() - start_t) * 1000) or 2
    return jsonify({
        "status": "perpendicular_active",
        "latency_ms": latency_ms,
        "ai1_model": NVIDIA_MODEL_AI1,
        "pre_thought_context": results
    })

# AI #2 (Response Engine): Combines perpendicular workbench context & ultra-fast spoken output
@app.route('/api/perpendicular_respond', methods=['POST'])
def handle_perpendicular_respond():
    data = request.json or {}
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    # Dynamic current date and time
    current_time_str = time.strftime("%Y-%m-%d %H:%M:%S %Z")
    today_date = time.strftime("%Y-%m-%d")

    # Inject AI #1's pre-searched workbench context and real-time stream analysis to eliminate latency
    cached_context = perpendicular_workbench.get("cached_tool_results", {})
    ai1_thought = perpendicular_workbench.get("ai1_intent_summary", "")
    context_injection = ""
    if ai1_thought:
        context_injection += f"\n[PERPENDICULAR AI #1 REAL-TIME INTENT SUMMARY]: {ai1_thought}"
    if cached_context:
        context_injection += f"\n[PERPENDICULAR AI #1 PRE-SEARCH CACHE (Availability data ready for use without tool calls!)]: {json.dumps(cached_context)}"
        perpendicular_workbench["cached_tool_results"] = {}

    agentic_system_prompt = f"""You are Charon, a hyper-intelligent, lightning-fast executive voice AI assistant (AI #2 on the Dual-AI Perpendicular Workbench).
Current Date & Time: {current_time_str} (Today is {today_date}).{context_injection}

CRITICAL AGENTIC BEHAVIOR RULES:
1. PROACTIVE & CHARISMATIC GREETINGS: If the user says hello, hi, yeah, hey, or greets you in any way, respond with elite intelligence, charisma, and warmth. Example: "Hello! I am Charon, your Dual-AI executive assistant. My perpendicular reasoning engine and calendar tools are ready. What would you like to check or schedule today?"
2. DO NOT CALL TOOLS FOR GREETINGS OR CASUAL CONVERSATION: If the user is just saying hello, asking who you are, or having general conversation, respond directly with text. DO NOT execute check_availability or book_meeting unless needed.
3. INSTANT ZERO-LATENCY ANSWERS USING CACHE: If the user asks about availability or schedule and [PERPENDICULAR AI #1 PRE-SEARCH CACHE] is shown above, USE THAT DATA DIRECTLY in your spoken response to answer instantly without making a slow tool call!
4. CALENDAR & SCHEDULE TOOL MASTERY: When the user explicitly asks to book a meeting or check a specific future date not in the cache, execute the book_meeting or check_availability tool.
5. SPOKEN CONVERSATIONAL STYLE: Speak naturally, concisely (1 to 3 short sentences maximum), and with confidence. Avoid markdown asterisks, bullet points, or long essays."""

    # Ensure messages array has our powerful agentic system prompt as messages[0]
    filtered_messages = [m for m in messages if m.get("role") != "system"]
    messages = [{"role": "system", "content": agentic_system_prompt}] + filtered_messages

    tools_definition = [
      {
        "type": "function",
        "function": {
          "name": "check_availability",
          "description": "Checks the user's calendar for busy slots on a given day.",
          "parameters": {
            "type": "object",
            "properties": {
              "date": { "type": "string", "description": f"ISO 8601 date to check (e.g., {today_date}T00:00:00+05:30)" }
            },
            "required": ["date"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "book_meeting",
          "description": "Schedules a meeting on the calendar.",
          "parameters": {
            "type": "object",
            "properties": {
              "title": { "type": "string", "description": "Meeting title" },
              "date_time": { "type": "string", "description": f"ISO 8601 date and time (e.g., {today_date}T09:00:00+05:30)" },
              "guest_email": { "type": "string", "description": "Guest email address" }
            },
            "required": ["title", "date_time", "guest_email"]
          }
        }
      }
    ]

    payload = {
        "model": NVIDIA_MODEL_AI2,
        "messages": messages,
        "tools": tools_definition,
        "temperature": 0.5,
        "max_tokens": 150
    }

    def call_nvidia_nim_with_retry(payload_dict, max_retries=2):
        for attempt in range(max_retries + 1):
            try:
                req = urllib.request.Request(
                    'https://integrate.api.nvidia.com/v1/chat/completions',
                    data=json.dumps(payload_dict).encode('utf-8'),
                    headers={
                        'Authorization': f'Bearer {NVIDIA_API_KEY}',
                        'Content-Type': 'application/json'
                    }
                )
                with urllib.request.urlopen(req, timeout=45) as response:
                    return json.loads(response.read().decode('utf-8'))
            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
                if e.code in (429, 500, 502, 503, 504) and attempt < max_retries:
                    print(f"[NVIDIA NIM RETRYABLE HTTP {e.code}] Attempt {attempt+1}/{max_retries}... waiting before retry.", flush=True)
                    time.sleep(1.0 * (2 ** attempt))
                    continue
                print(f"[NVIDIA NIM HTTP ERROR] {e.code}: {err_body}", flush=True)
                raise Exception(f"NVIDIA API Error {e.code}: {err_body}")
            except Exception as e:
                if attempt < max_retries and not isinstance(e, KeyboardInterrupt):
                    print(f"[NVIDIA NIM RETRYABLE ERROR] {e} on attempt {attempt+1}... retrying.", flush=True)
                    time.sleep(1.0 * (2 ** attempt))
                    continue
                raise

    try:
        result_data = call_nvidia_nim_with_retry(payload)
        choice = result_data.get("choices", [{}])[0].get("message", {})
        
        # Check if Llama wants to execute additional tools
        executed_tools = []
        if choice.get("tool_calls"):
            messages.append(choice)
            for tc in choice["tool_calls"]:
                fn_name = tc.get("function", {}).get("name")
                args_str = tc.get("function", {}).get("arguments", "{}")
                try:
                    args = json.loads(args_str)
                except Exception as parse_err:
                    print(f"[TOOL JSON PARSE WARNING] Could not parse args for {fn_name}: {args_str}", flush=True)
                    args = {}
                
                tool_res = None
                try:
                    if fn_name == "check_availability":
                        tool_res = check_availability(date_iso=args.get("date", time.strftime("%Y-%m-%dT00:00:00+05:30")))
                    elif fn_name == "book_meeting":
                        tool_res = book_meeting(date_time_iso=args.get("date_time"), name=args.get("guest_email"))
                    else:
                        tool_res = {"error": f"Unknown tool: {fn_name}"}
                except Exception as tool_err:
                    print(f"[TOOL EXECUTION ERROR] {fn_name} failed: {tool_err}", flush=True)
                    tool_res = {"error": f"Tool execution failed: {str(tool_err)}"}
                    
                executed_tools.append({
                    "toolCallId": tc.get("id", str(time.time())),
                    "toolName": fn_name,
                    "args": args,
                    "result": tool_res
                })
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id", str(time.time())),
                    "name": fn_name,
                    "content": json.dumps(tool_res)
                })
                
            # Second call for spoken summary after tool execution
            payload_second = {
                "model": NVIDIA_MODEL_AI2,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 512
            }
            data2 = call_nvidia_nim_with_retry(payload_second)
            choice = data2.get("choices", [{}])[0].get("message", {})

        return jsonify({
            "status": "success",
            "reply": choice.get("content", "I processed your request."),
            "executed_tools": executed_tools
        })

    except Exception as e:
        traceback.print_exc()
        print(f"[NVIDIA NIM ERROR] {e}", flush=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("[READY] Perpendicular Dual-AI Workbench running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)