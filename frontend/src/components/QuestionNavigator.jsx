// src/components/QuestionNavigator.jsx
import { CheckCircle, Circle, Flag } from 'lucide-react';

export default function QuestionNavigator({ questions, answers, currentIndex, onNavigate, flagged = [] }) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
        Questions
      </h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-surface-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-success-500/40 border border-success-500/60" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-surface-700 border border-surface-600" />
          Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-500 border border-brand-400" />
          Current
        </span>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
          const isCurrent = index === currentIndex;
          const isFlagged = flagged.includes(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onNavigate(index)}
              className={`
                relative w-full aspect-square rounded-xl flex items-center justify-center
                text-sm font-semibold transition-all duration-200
                hover:scale-105 active:scale-95
                ${isCurrent
                  ? 'bg-brand-500 text-white shadow-glow ring-2 ring-brand-400/50'
                  : isAnswered
                    ? 'bg-success-500/20 text-success-400 border border-success-500/30 hover:bg-success-500/30'
                    : 'bg-white/5 text-surface-300 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              {index + 1}
              {isFlagged && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-warning-400" fill="currentColor" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-surface-300">
        <span>{Object.values(answers).filter(a => a !== null && a !== undefined && a !== '').length} / {questions.length} answered</span>
        <span>{questions.length - Object.values(answers).filter(a => a !== null && a !== undefined && a !== '').length} remaining</span>
      </div>
    </div>
  );
}
