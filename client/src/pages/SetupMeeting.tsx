import { useLocation } from "wouter";
import MeetingSetupForm from "@/components/MeetingSetupForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SetupMeeting() {
  const [, setLocation] = useLocation();

  const handleStartMeeting = (data: any) => {
    console.log('Meeting started with:', data);
    localStorage.setItem('currentMeeting', JSON.stringify(data));
    setLocation('/active');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')} 
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Setup New Meeting</h1>
          <p className="text-muted-foreground">
            Add attendees and duration to see the real-time cost
          </p>
        </div>

        <MeetingSetupForm onStartMeeting={handleStartMeeting} />
      </div>
    </div>
  );
}
