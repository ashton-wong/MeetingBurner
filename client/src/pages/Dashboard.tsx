import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import WeeklyStatsOverview from "@/components/WeeklyStatsOverview";
import MeetingHistoryCard from "@/components/MeetingHistoryCard";
import { Plus, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const mockMeetings = [
    {
      id: "1",
      title: "Weekly Team Sync",
      date: new Date(2025, 9, 28, 10, 0),
      scheduledMinutes: 30,
      actualMinutes: 45,
      cost: 337,
      attendeeCount: 5,
      grade: "C+",
      gradeDescription: "Could've Been Napping",
    },
    {
      id: "2",
      title: "Sprint Planning",
      date: new Date(2025, 9, 27, 14, 0),
      scheduledMinutes: 60,
      actualMinutes: 55,
      cost: 550,
      attendeeCount: 6,
      grade: "A-",
      gradeDescription: "Actually Productive",
    },
    {
      id: "3",
      title: "Client Demo",
      date: new Date(2025, 9, 26, 11, 0),
      scheduledMinutes: 45,
      actualMinutes: 90,
      cost: 675,
      attendeeCount: 4,
      grade: "D",
      gradeDescription: "Time Vortex",
    },
    {
      id: "4",
      title: "Daily Standup",
      date: new Date(2025, 9, 28, 9, 0),
      scheduledMinutes: 15,
      actualMinutes: 12,
      cost: 90,
      attendeeCount: 5,
      grade: "A+",
      gradeDescription: "Efficient AF",
    },
  ];

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
          totalCost={2450}
          totalHours={14.5}
          meetingCount={12}
          averageGrade="B-"
        />

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Recent Meetings</h2>
            <Button variant="ghost" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Trends
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockMeetings.map((meeting) => (
              <MeetingHistoryCard
                key={meeting.id}
                {...meeting}
                onClick={() => console.log('View meeting:', meeting.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-chart-1/10 rounded-lg border border-primary/20">
          <div className="max-w-2xl">
            <h3 className="text-xl font-semibold mb-2">
              💡 Pro Tip: Cut Meeting Time by 30%
            </h3>
            <p className="text-muted-foreground mb-4">
              Based on your meeting patterns, you could save <span className="font-semibold text-foreground">$735</span> this week by:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Adding agendas to 60% of your meetings (saves 15 min avg)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Converting 3 meetings to async updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Reducing attendee count by 2 on recurring syncs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
