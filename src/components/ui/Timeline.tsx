import { TimelineStep } from '@/types';
import clsx from 'clsx';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type TimelineProps = { steps: TimelineStep[] };

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex gap-4">
          {/* Icon column */}
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              step.status === 'completed' && 'bg-green-100',
              step.status === 'active' && 'bg-blue-100',
              step.status === 'pending' && 'bg-gray-100',
            )}>
              {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {step.status === 'active' && <Clock className="w-5 h-5 text-blue-600 animate-pulse" />}
              {step.status === 'pending' && <Circle className="w-5 h-5 text-gray-400" />}
            </div>
            {idx < steps.length - 1 && (
              <div className={clsx('w-0.5 flex-1 my-1', step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200')} />
            )}
          </div>
          {/* Content */}
          <div className="pb-6 flex-1">
            <p className={clsx(
              'text-sm font-semibold',
              step.status === 'completed' && 'text-gray-700',
              step.status === 'active' && 'text-blue-700',
              step.status === 'pending' && 'text-gray-400',
            )}>{step.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
            {step.completedAt && (
              <p className="text-xs text-green-600 mt-1">✓ {formatDate(step.completedAt)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
