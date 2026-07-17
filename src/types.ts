export type ConnectionState = 'disconnected' | 'connecting' | 'ready' | 'listening' | 'speaking';

export interface ToolExecutionData {
  callId: string;
  name: 'book_meeting' | 'check_availability' | string;
  status: 'querying' | 'success' | 'error';
  args: Record<string, any>;
  result?: string;
  timestamp: Date;
}

export interface MessageItem {
  id: string;
  role: 'user' | 'ai' | 'system' | 'tool';
  text?: string;
  toolData?: ToolExecutionData;
  timestamp: Date;
}
