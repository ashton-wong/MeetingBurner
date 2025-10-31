import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

interface MeetingHistoryCardProps {
  id: string;
  title: string;
  date: Date;
  scheduledMinutes: number;
  actualMinutes: number;
  cost: number;
  attendeeCount: number;
  grade: string;
  gradeDescription: string;
  onClick?: () => void;
}

export default function MeetingHistoryCard({
  title,
  date,
  scheduledMinutes,
  actualMinutes,
  cost,
  attendeeCount,
  grade,
  gradeDescription,
  onClick,
}: MeetingHistoryCardProps) {
  const isOvertime = actualMinutes > scheduledMinutes;
  const gradeColor = 
    grade.startsWith('A') ? 'bg-chart-5 text-white' :
    grade.startsWith('B') ? 'bg-chart-3 text-white' :
    grade.startsWith('C') ? 'bg-chart-4 text-white' :
    grade.startsWith('D') ? 'bg-primary text-white' :
    'bg-destructive text-white';

  return (
    <Card 
      className="p-6 hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-meeting-${title.replace(/\s/g, '-').toLowerCase()}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate" data-testid="text-meeting-title">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(date, 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        <Badge className={gradeColor} data-testid="badge-grade">
          {grade}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{gradeDescription}</p>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold" data-testid="text-cost">${cost}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={isOvertime ? "text-destructive font-semibold" : ""} data-testid="text-duration">
            {actualMinutes}m {isOvertime && `(${scheduledMinutes}m planned)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span data-testid="text-attendees">{attendeeCount}</span>
        </div>
      </div>
    </Card>
  );
}
