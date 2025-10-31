import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import LiveMeetingTimer from "@/components/LiveMeetingTimer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SALARY_BANDS } from "@shared/schema";
import { Users } from "lucide-react";
import { getMeeting, updateMeeting } from "@/lib/api";
import { calculateEfficiencyScore } from "@/lib/scoring";
import { queryClient } from "@/lib/queryClient";

export default function ActiveMeeting() {
  const [, setLocation] = useLocation();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    const storedId = localStorage.getItem('activeMeetingId');
    const storedAttendees = localStorage.getItem('meetingAttendees');
    
    if (storedId) {
      setMeetingId(storedId);
    } else {
      setLocation('/setup');
    }

    if (storedAttendees) {
      setAttendees(JSON.parse(storedAttendees));
    }
  }, [setLocation]);

  const { data: meeting } = useQuery({
    queryKey: ['/api/meetings', meetingId],
    queryFn: () => getMeeting(meetingId!),
    enabled: !!meetingId,
  });

  const updateMeetingMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateMeeting(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
    },
  });

  if (!meeting || !meetingId) return null;

  const costPerSecond = attendees.reduce(
    (sum: number, att: any) => sum + (SALARY_BANDS[att.role as keyof typeof SALARY_BANDS] / 3600),
    0
  );

  const handleEndMeeting = (actualMinutes: number, totalCost: number) => {
    const score = calculateEfficiencyScore({
      scheduledMinutes: meeting.scheduledDurationMinutes,
      actualMinutes,
      hasAgenda: meeting.hasAgenda,
      attendeeCount: meeting.attendeeCount,
    });

    updateMeetingMutation.mutate({
      id: meetingId,
      updates: {
        actualDurationMinutes: actualMinutes,
        totalCost: Math.round(totalCost),
        efficiencyScore: score.score,
        efficiencyGrade: score.grade,
        endedAt: new Date(),
      },
    });

    localStorage.removeItem('activeMeetingId');
    localStorage.removeItem('meetingAttendees');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2" data-testid="text-meeting-title">
            {meeting.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{meeting.attendeeCount} attendees</span>
            </div>
            <div>•</div>
            <div>Scheduled: {meeting.scheduledDurationMinutes} minutes</div>
            {meeting.hasAgenda && (
              <>
                <div>•</div>
                <Badge variant="default" className="bg-chart-5">Has Agenda</Badge>
              </>
            )}
          </div>
        </div>

        <LiveMeetingTimer
          scheduledMinutes={meeting.scheduledDurationMinutes}
          costPerSecond={costPerSecond}
          onEndMeeting={handleEndMeeting}
        />

        {attendees.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="font-semibold mb-4">Meeting Attendees</h3>
            <div className="flex flex-wrap gap-2">
              {attendees.map((att: any) => (
                <Badge key={att.id} variant="secondary">
                  {att.name} ({att.role})
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
