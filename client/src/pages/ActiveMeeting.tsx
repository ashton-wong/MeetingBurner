import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import LiveMeetingTimer from "@/components/LiveMeetingTimer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SALARY_BANDS } from "@shared/schema";
import { Users } from "lucide-react";

export default function ActiveMeeting() {
  const [, setLocation] = useLocation();
  const [meetingData, setMeetingData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentMeeting');
    if (stored) {
      setMeetingData(JSON.parse(stored));
    } else {
      setLocation('/setup');
    }
  }, [setLocation]);

  if (!meetingData) return null;

  const costPerSecond = meetingData.attendees.reduce(
    (sum: number, att: any) => sum + (SALARY_BANDS[att.role as keyof typeof SALARY_BANDS] / 3600),
    0
  );

  const handleEndMeeting = (actualMinutes: number, totalCost: number) => {
    console.log('Meeting ended:', { actualMinutes, totalCost });
    
    const score = calculateEfficiencyScore({
      scheduledMinutes: meetingData.durationMinutes,
      actualMinutes,
      hasAgenda: meetingData.hasAgenda,
      attendeeCount: meetingData.attendees.length,
    });

    localStorage.setItem('lastMeetingResult', JSON.stringify({
      ...meetingData,
      actualMinutes,
      totalCost,
      ...score,
    }));
    localStorage.removeItem('currentMeeting');
    setLocation('/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2" data-testid="text-meeting-title">
            {meetingData.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{meetingData.attendees.length} attendees</span>
            </div>
            <div>•</div>
            <div>Scheduled: {meetingData.durationMinutes} minutes</div>
            {meetingData.hasAgenda && (
              <>
                <div>•</div>
                <Badge variant="default" className="bg-chart-5">Has Agenda</Badge>
              </>
            )}
          </div>
        </div>

        <LiveMeetingTimer
          scheduledMinutes={meetingData.durationMinutes}
          costPerSecond={costPerSecond}
          onEndMeeting={handleEndMeeting}
        />

        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4">Meeting Attendees</h3>
          <div className="flex flex-wrap gap-2">
            {meetingData.attendees.map((att: any) => (
              <Badge key={att.id} variant="secondary">
                {att.name} ({att.role})
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function calculateEfficiencyScore({
  scheduledMinutes,
  actualMinutes,
  hasAgenda,
  attendeeCount,
}: {
  scheduledMinutes: number;
  actualMinutes: number;
  hasAgenda: boolean;
  attendeeCount: number;
}) {
  let score = 100;
  const breakdown = [];

  const isOvertime = actualMinutes > scheduledMinutes;
  const endedEarly = actualMinutes < scheduledMinutes;

  breakdown.push({
    label: "Started on time",
    points: 0,
    reason: "Meeting started as scheduled",
  });

  if (isOvertime) {
    score -= 10;
    breakdown.push({
      label: "Ran over time",
      points: -10,
      reason: `Meeting exceeded scheduled duration by ${actualMinutes - scheduledMinutes} minutes`,
    });
  }

  if (!hasAgenda) {
    score -= 15;
    breakdown.push({
      label: "No agenda",
      points: -15,
      reason: "No agenda was provided for this meeting",
    });
  } else {
    breakdown.push({
      label: "Had agenda",
      points: 0,
      reason: "Meeting had a clear agenda",
    });
  }

  if (attendeeCount > 8) {
    score -= 20;
    breakdown.push({
      label: "Too many attendees",
      points: -20,
      reason: `${attendeeCount} attendees is inefficient for decision-making`,
    });
  }

  if (endedEarly) {
    score += 10;
    breakdown.push({
      label: "Ended early",
      points: 10,
      reason: `Meeting ended ${scheduledMinutes - actualMinutes} minutes early`,
    });
  }

  if (actualMinutes < 30) {
    score += 10;
    breakdown.push({
      label: "Brief meeting",
      points: 10,
      reason: "Meeting was under 30 minutes",
    });
  }

  const grade = 
    score >= 95 ? 'A+' :
    score >= 90 ? 'A' :
    score >= 85 ? 'A-' :
    score >= 80 ? 'B+' :
    score >= 75 ? 'B' :
    score >= 70 ? 'B-' :
    score >= 65 ? 'C+' :
    score >= 60 ? 'C' :
    score >= 55 ? 'C-' :
    score >= 50 ? 'D+' :
    score >= 45 ? 'D' :
    'F';

  const gradeDescription = 
    grade.startsWith('A') ? 'Actually Productive' :
    grade.startsWith('B') ? 'Borderline Acceptable' :
    grade.startsWith('C') ? "Could've Been Napping" :
    grade.startsWith('D') ? 'Time Vortex' :
    'Everyone Could\'ve Been Napping';

  return { grade, gradeDescription, score, breakdown };
}
