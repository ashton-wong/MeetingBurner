import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import MeetingSetupForm from "@/components/MeetingSetupForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMeeting } from "@/lib/api";
import { SALARY_BANDS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SetupMeeting() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createMeetingMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: (meeting) => {
      localStorage.setItem('activeMeetingId', meeting.id);
      setLocation('/active');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartMeeting = (data: any) => {
    createMeetingMutation.mutate({
      title: data.title,
      scheduledDurationMinutes: data.durationMinutes,
      totalCost: 0,
      hasAgenda: data.hasAgenda,
      attendeeCount: data.attendees.length,
    });

    localStorage.setItem('meetingAttendees', JSON.stringify(data.attendees));
    // store agenda locally so the active meeting can show and track checklist
    if (data.agenda) {
      localStorage.setItem('meetingAgenda', JSON.stringify(data.agenda));
      // clear any previous checked state
      localStorage.removeItem('meetingAgendaChecked');
    }
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
