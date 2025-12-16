import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface PollHeaderProps {
  question: string;
  creatorName: string;
  deadline: string;
  showRealtimeResults: boolean;
  isExpired?: boolean;
}

export default function PollHeader({
  question,
  creatorName,
  deadline,
  showRealtimeResults,
  isExpired = false,
}: PollHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Poll Question */}
      <h1 className="text-2xl md:text-3xl font-bold text-primary-900">{question}</h1>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 items-center text-sm text-primary-600">
        {/* Creator */}
        <div className="flex items-center gap-1">
          <span className="font-medium">Created by:</span>
          <span>{creatorName}</span>
        </div>

        {/* Divider */}
        <span className="text-primary-300">•</span>

        {/* Deadline */}
        <div className="flex items-center gap-1">
          <span className="font-medium">Deadline:</span>
          <span>{formatDate(deadline)}</span>
        </div>

        {/* Status Badge */}
        {isExpired && (
          <>
            <span className="text-primary-300">•</span>
            <Badge variant="error">Voting Closed</Badge>
          </>
        )}

        {!isExpired && showRealtimeResults && (
          <>
            <span className="text-primary-300">•</span>
            <Badge variant="default">Real-time Results</Badge>
          </>
        )}
      </div>
    </div>
  );
}
