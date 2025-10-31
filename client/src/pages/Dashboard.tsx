import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import WeeklyStatsOverview from "@/components/WeeklyStatsOverview";
import MeetingHistoryCard from "@/components/MeetingHistoryCard";
import { Plus, TrendingUp } from "lucide-react";
import { getMeetings } from "@/lib/api";
import type { Meeting } from "@shared/schema";

export default function Dashboard() {
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    queryFn: getMeetings,
  });

  const totalCost = meetings.reduce((sum, m) => sum + m.totalCost, 0);
  const totalMinutes = meetings.reduce((sum, m) => sum + (m.actualDurationMinutes || 0), 0);
  const totalHours = totalMinutes / 60;
  
  const validGrades = meetings.filter(m => m.efficiencyGrade).map(m => m.efficiencyGrade!);
  const averageGradeValue = validGrades.length > 0
    ? validGrades.reduce((sum, grade) => {
        const value = 
          grade.startsWith('A') ? 90 :
          grade.startsWith('B') ? 80 :
          grade.startsWith('C') ? 70 :
          grade.startsWith('D') ? 60 : 50;
        return sum + value;
      }, 0) / validGrades.length
    : 0;
  
  const averageGrade = 
    averageGradeValue >= 90 ? 'A' :
    averageGradeValue >= 80 ? 'B' :
    averageGradeValue >= 70 ? 'C' :
    averageGradeValue >= 60 ? 'D' : 'F';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your meeting costs and efficiency in real-time
            </p>
          </div>
          <Link href="/setup">
            <Button size="lg" data-testid="button-new-meeting">
              <Plus className="w-5 h-5 mr-2" />
              New Meeting
            </Button>
          </Link>
        </div>

        <WeeklyStatsOverview
          totalCost={totalCost}
          totalHours={totalHours}
          meetingCount={meetings.length}
          averageGrade={averageGrade}
        />

        {meetings.length > 0 ? (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Recent Meetings</h2>
              <Button variant="ghost" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Trends
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meetings.map((meeting) => (
                <MeetingHistoryCard
                  key={meeting.id}
                  id={meeting.id}
                  title={meeting.title}
                  date={new Date(meeting.startedAt || new Date())}
                  scheduledMinutes={meeting.scheduledDurationMinutes}
                  actualMinutes={meeting.actualDurationMinutes || 0}
                  cost={meeting.totalCost}
                  attendeeCount={meeting.attendeeCount}
                  grade={meeting.efficiencyGrade || "N/A"}
                  gradeDescription={getGradeDescription(meeting.efficiencyGrade || "")}
                  onClick={() => console.log('View meeting:', meeting.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center py-12">
            <p className="text-muted-foreground mb-4">No meetings tracked yet</p>
            <Link href="/setup">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Start Your First Meeting
              </Button>
            </Link>
          </div>
        )}

        {meetings.length > 0 && (
          <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-chart-1/10 rounded-lg border border-primary/20">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold mb-2">
                💡 Pro Tip: Cut Meeting Time by 30%
              </h3>
              <p className="text-muted-foreground mb-4">
                Based on your meeting patterns, you could save <span className="font-semibold text-foreground">${Math.round(totalCost * 0.3)}</span> by:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Adding agendas to meetings (saves 15 min avg)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Converting recurring syncs to async updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Reducing attendee count by 2 on large meetings</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getGradeDescription(grade: string): string {
  if (grade.startsWith('A')) return 'Actually Productive';
  if (grade.startsWith('B')) return 'Borderline Acceptable';
  if (grade.startsWith('C')) return "Could've Been Napping";
  if (grade.startsWith('D')) return 'Time Vortex';
  return 'Everyone Could\'ve Been Napping';
}
