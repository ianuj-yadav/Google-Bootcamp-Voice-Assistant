import React from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, Clock, User, CheckCircle, Spinner, WarningCircle } from '@phosphor-icons/react';

export function ToolExecutionCard({ tool }) {
  const { name, args, status, result, timestamp } = tool;

  const isBooking = name === 'book_meeting';
  const isChecking = name === 'check_availability';

  const getStatusChip = () => {
    if (status === 'querying') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono">
          <Spinner size={13} className="animate-spin" />
          <span>Executing Local API...</span>
        </span>
      );
    }
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
          <CheckCircle size={13} weight="fill" className="text-emerald-400" />
          <span>Success</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono">
        <WarningCircle size={13} weight="fill" className="text-red-400" />
        <span>Error</span>
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="my-3 mx-2 p-4 rounded-xl border border-blue-500/30 bg-slate-900/70 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md overflow-hidden relative group"
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${status === 'success' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarCheck size={16} weight="bold" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              {isBooking ? 'Google Calendar : Book Meeting' : isChecking ? 'Google Calendar : Check Availability' : name}
            </span>
            <p className="text-[10px] font-mono text-slate-400">
              {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
            </p>
          </div>
        </div>
        <div>{getStatusChip()}</div>
      </div>

      {/* Structured Parameters Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 font-mono text-xs">
        {isBooking && (
          <>
            <div className="flex items-start gap-2">
              <span className="text-slate-400 select-none">Title:</span>
              <span className="text-blue-300 font-semibold break-all">{args.title || 'Untitled Meeting'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-slate-400 select-none flex items-center gap-1"><Clock size={13} /> Time:</span>
              <span className="text-emerald-300 break-all">{args.date_time || 'Not specified'}</span>
            </div>
            <div className="sm:col-span-2 flex items-start gap-2 pt-1 border-t border-slate-800/40">
              <span className="text-slate-400 select-none flex items-center gap-1"><User size={13} /> Guest:</span>
              <span className="text-amber-300 break-all">{args.guest_email || 'No guest email'}</span>
            </div>
          </>
        )}

        {isChecking && (
          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="text-slate-400 select-none flex items-center gap-1"><Clock size={13} /> Date Checked:</span>
            <span className="text-cyan-300 font-semibold">{args.date || 'Today'}</span>
          </div>
        )}

        {!isBooking && !isChecking && (
          <div className="sm:col-span-2 text-slate-300">
            <pre className="text-[11px] overflow-x-auto">{JSON.stringify(args, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Execution Result Box */}
      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[11px]"
        >
          <span className="text-slate-400 block mb-1">API Response:</span>
          <div className={`p-2.5 rounded-md ${status === 'error' ? 'bg-red-950/40 text-red-200 border border-red-800/50' : 'bg-slate-950/70 text-emerald-300 border border-emerald-500/20'} overflow-x-auto whitespace-pre-wrap`}>
            {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
