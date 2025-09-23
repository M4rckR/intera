'use client'
import { Button } from '@/app/components/ui/button';
import { CalendarClock, XCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

type ActionsBarProps = {
  onSchedule: () => void;
  onReject: () => void;
  isScheduling?: boolean;
  isRejecting?: boolean;
  disabled?: boolean;
};

export function ActionsBar({ onSchedule, onReject, isScheduling = false, isRejecting = false, disabled = false }: ActionsBarProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Tooltip.Root delayDuration={200}>
        <Tooltip.Trigger asChild>
          <span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={onSchedule}
              disabled={disabled || isScheduling}
              title="Agendar / Reprogramar"
            >
              <CalendarClock className="w-5 h-5" />
            </Button>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
          Agendar / Reprogramar
        </Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root delayDuration={200}>
        <Tooltip.Trigger asChild>
          <span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={onReject}
              disabled={disabled || isRejecting}
              title="Rechazar"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="z-50 bg-gray-900 text-white px-2 py-1 rounded shadow">
          Rechazar
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}


