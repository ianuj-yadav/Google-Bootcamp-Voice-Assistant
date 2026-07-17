import { motion } from 'motion/react';
import { ToolExecutionData } from '../types';
import { Calendar, CheckCircle2, Clock, AlertCircle, Sparkles, User, CalendarDays } from 'lucide-react';

export interface ToolCardProps {
  toolData: ToolExecutionData;
}

export function ToolCard({ toolData }: ToolCardProps) {
  const isBooking = toolData.name === 'book_meeting';
  const isChecking = toolData.name === 'check_availability';

  const getStatusBadge = () => {
    switch (toolData.status) {
      case 'querying':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold animate-pulse">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Executing...</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isBooking ? 'Slot Booked' : 'Completed'}</span>
          </span>
        );
      case 'error':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Execution Failed</span>
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className={`w-full p-4 sm:p-5 rounded-2xl border backdrop-blur-md shadow-xl my-2 text-left font-sans transition-all ${
        toolData.status === 'success'
          ? 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-500/5'
          : toolData.status === 'error'
          ? 'bg-rose-950/20 border-rose-500/30 shadow-rose-500/5'
          : 'bg-slate-900/70 border-blue-500/30 shadow-blue-500/5'
      }`}
    >
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isBooking ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{isBooking ? 'Google Calendar: Book Meeting' : isChecking ? 'Google Calendar: Check Availability' : toolData.name}</span>
            </h4>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              API Call ID: {toolData.callId.slice(0, 10)}...
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Parameter Tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        {toolData.args && Object.entries(toolData.args).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[10px] w-20 shrink-0 truncate">
              {key}:
            </span>
            <span className="font-semibold text-slate-200 truncate font-mono">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>

      {/* Execution Output Box */}
      {toolData.result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-xl border text-xs font-mono leading-relaxed whitespace-pre-wrap ${
            toolData.status === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/25 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/25 text-rose-300'
          }`}
        >
          {toolData.result}
        </motion.div>
      )}
    </motion.div>
  );
}
