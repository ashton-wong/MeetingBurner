import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EfficiencyScoreCard from "@/components/EfficiencyScoreCard";
import { Home, Plus } from "lucide-react";

export default function MeetingResults() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastMeetingResult');
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Meeting Complete!</h1>
          <p className="text-muted-foreground">Here's how you did</p>
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
