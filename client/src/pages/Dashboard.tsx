import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import WeeklyStatsOverview from "@/components/WeeklyStatsOverview";
import MeetingHistoryCard from "@/components/MeetingHistoryCard";
import { Plus, TrendingUp } from "lucide-react";
import { getMeetings } from "@/lib/api";
import type { Meeting } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    queryFn: getMeetings,
  });

  // Merge server-side meetings with any locally-saved meeting reports so the
  // dashboard still shows results if the in-memory server storage was restarted
  // or missing entries. Local reports are saved under keys like
  // `meetingReport:<id>` (written when a meeting ends).
  const localReports: any[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('meetingReport:')) {
        try {
          const id = key.split(':')[1];
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
            localReports.push({
            id,
            title: parsed.title || 'Meeting',
            startedAt: parsed.startedAt ? new Date(parsed.startedAt) : new Date(),
            scheduledDurationMinutes: parsed.durationMinutes ?? 0,
              actualDurationMinutes: parsed.actualMinutes ?? 0,
              totalCost: parsed.totalCost ?? 0,
              // include agenda report if present so dashboard can reason about per-item burn
              agendaReport: parsed.agendaReport || [],
            attendeeCount: Array.isArray(parsed.attendees) ? parsed.attendees.length : (parsed.attendees ?? 0),
            efficiencyGrade: parsed.grade || '',
            efficiencyScore: parsed.score ?? null,
          });
        } catch (e) {
          // ignore malformed entries
        }
      }
    }
  } catch (e) {
    // localStorage might be unavailable in some environments; ignore
  }

  // Create a merged view: merge server meetings with local reports, preferring
  // local report fields when available so newly finished meetings show their
  // full details immediately even if the in-memory server hasn't been updated.
  const mergedMeetings = [...meetings];
  for (const lr of localReports) {
    const idx = mergedMeetings.findIndex((m) => m.id === lr.id);
    if (idx >= 0) {
      // merge, letting local report values override server values
      mergedMeetings[idx] = { ...mergedMeetings[idx], ...lr } as any;
    } else {
      mergedMeetings.push(lr as any);
    }
  }

  // Ensure meetings are sorted by startedAt descending so recent meetings appear first
  mergedMeetings.sort((a: any, b: any) => {
    const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return bTime - aTime;
  });

  const totalCost = mergedMeetings.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const totalMinutes = mergedMeetings.reduce((sum, m) => sum + (m.actualDurationMinutes || 0), 0);
  const totalHours = totalMinutes / 60;
  // Compute potential savings based on agenda analysis per meeting:
  // - For agenda items flagged as "could've been an email" (ratio < 0.5),
  //   count the cost of the allotted time as avoidable (allottedSeconds * costPerSecond).
  // - For agenda items that went overtime (ratio > 1), add the burnedCash already
  //   computed at meeting end (this is the cost of the overtime portion).
  let potentialSavings = 0;
  let emailableCount = 0;
  let emailableBurnedCash = 0;
  for (const m of mergedMeetings) {
    const meetingTotalCost = Number(m.totalCost || 0);
    const actualMinutes = Number(m.actualDurationMinutes || 0);
    const actualSeconds = actualMinutes * 60;
    const scheduledMinutes = Number(m.scheduledDurationMinutes || 0);
    const fallbackSeconds = scheduledMinutes * 60 || 0;

    const costPerSecond = actualSeconds > 0 ? (meetingTotalCost / actualSeconds) : (fallbackSeconds > 0 ? (meetingTotalCost / fallbackSeconds) : 0);

  const agenda = (m as any).agendaReport || [];
    for (const item of agenda) {
      try {
        const ratio = Number(item.ratio || 0);
        const allottedSeconds = Number(item.allottedSeconds || 0);
        const burnedCash = Number(item.burnedCash || 0);

        if (ratio < 0.5) {
          // could've been an email: count the cost of the allotted time as savings
          potentialSavings += allottedSeconds * costPerSecond;
          // track count and cash burned for the pro tip
          emailableCount += 1;
          emailableBurnedCash += allottedSeconds * costPerSecond;
        } else if (ratio > 1) {
          // overtime: add the already-calculated burnedCash for the overtime portion
          potentialSavings += burnedCash;
        }
      } catch (e) {
        // ignore malformed agenda items
      }
    }
  }
  
  const validGrades = mergedMeetings.filter(m => m.efficiencyGrade).map(m => m.efficiencyGrade!);
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
          meetingCount={mergedMeetings.length}
          averageGrade={averageGrade}
          potentialSavings={potentialSavings}
        />

  {mergedMeetings.length > 0 ? (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Recent Meetings</h2>
              <Button variant="ghost" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Trends
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mergedMeetings.map((meeting) => (
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
                  onClick={() => setLocation(`/results/${meeting.id}`)}
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

              {mergedMeetings.length > 0 && (
                <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-chart-1/10 rounded-lg border border-primary/20">
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-semibold mb-2">
                      💡 Pro Tip: Convert Recurring Syncs to Async Updates
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Based on your past meetings, <span className="font-semibold">{emailableCount}</span> agenda item{emailableCount === 1 ? '' : 's'} #couldvebeenemails</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>If these agenda items were #emails you would've saved <span className="font-semibold">${emailableBurnedCash.toFixed(2)}</span></span>
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
