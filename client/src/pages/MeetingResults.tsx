import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EfficiencyScoreCard from "@/components/EfficiencyScoreCard";
import { Home, Plus } from "lucide-react";

export default function MeetingResults() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<any>(null);
  const [match, params] = useRoute('/results/:id');

  useEffect(() => {
    // if route has an id, try to load the stored report for that meeting
    if (match && params?.id) {
      const key = `meetingReport:${params.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setResults(JSON.parse(stored));
        return;
      }
    }

    // fallback to lastMeetingResult
    const stored = localStorage.getItem('lastMeetingResult');
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      setLocation('/');
    }
  }, [setLocation, match, params]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Meeting Complete! 🎃</h1>
          <p className="text-muted-foreground">Here's how you did — spooky edition</p>
        </div>

        <EfficiencyScoreCard
          grade={results.grade}
          gradeDescription={results.gradeDescription}
          totalScore={results.score}
          breakdown={results.breakdown}
        />

        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4">Meeting Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Title</p>
              <p className="font-semibold">{results.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Cost</p>
              <p className="font-semibold text-destructive">${results.totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Scheduled Duration</p>
              <p className="font-semibold">{results.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-muted-foreground">Actual Duration</p>
              <p className={`font-semibold ${results.actualMinutes > results.durationMinutes ? 'text-destructive' : ''}`}>
                {results.actualMinutes} minutes
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Attendees</p>
              <p className="font-semibold">{results.attendees.length} people</p>
            </div>
            <div>
              <p className="text-muted-foreground">Had Agenda?</p>
              <p className="font-semibold">{results.hasAgenda ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>

        {results.agendaReport && results.agendaReport.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="font-semibold mb-4">Agenda Analysis</h3>
            <div className="space-y-4">
              {results.agendaReport.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">Allotted: {Math.round(item.allottedSeconds/60)}m — Actual: {Math.round(item.actualSeconds/60)}m</div>

                    {item.ratio < 0.5 && (
                      <p className="mt-2 text-sm text-muted-foreground"># could've been an email — or a potion 🧪</p>
                    )}

                    {item.ratio > 1 && (
                      <p className="mt-2 text-sm text-destructive">Burning cash: ${item.burnedCash.toFixed(2)} 🔥</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {results.transcript && (
          <Card className="mt-6 p-6">
            <h3 className="font-semibold mb-4">Transcript</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-auto">{results.transcript}</div>
          </Card>
        )}

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setLocation('/')}
            data-testid="button-dashboard"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            size="lg" 
            onClick={() => setLocation('/setup')}
            data-testid="button-new-meeting"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Another Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
