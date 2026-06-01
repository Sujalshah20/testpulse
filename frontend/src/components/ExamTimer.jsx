// src/components/ExamTimer.jsx
import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamTimer({ timeLimit, onExpire }) {
  const [remaining, setRemaining] = useState(timeLimit);
  const timerRef = useRef(null);
  const hasExpired = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasExpired.current) {
            hasExpired.current = true;
            setTimeout(() => onExpire(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const isLow = remaining < 300;
  const isCritical = remaining < 60;
  const percentage = (remaining / timeLimit) * 100;

  return (
    <div className={`
      relative flex items-center gap-3 px-5 py-3 rounded-2xl font-mono text-xl font-bold
      transition-all duration-500 overflow-hidden
      ${isCritical 
        ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40 animate-pulse' 
        : isLow 
          ? 'bg-warning-500/15 text-warning-400 border border-warning-500/30' 
          : 'bg-brand-500/10 text-brand-300 border border-brand-500/20'}
    `}>
      {/* Progress bar background */}
      <div 
        className={`absolute inset-0 opacity-10 transition-all duration-1000 ${
          isCritical ? 'bg-danger-500' : isLow ? 'bg-warning-500' : 'bg-brand-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
      
      <div className="relative z-10 flex items-center gap-3">
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        ) : (
          <Clock className="w-5 h-5" />
        )}
        <span>{mins}:{secs}</span>
      </div>
    </div>
  );
}
