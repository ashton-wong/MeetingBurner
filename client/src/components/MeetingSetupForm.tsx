import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Timer, DollarSign } from "lucide-react";
import { SALARY_BANDS, type Role } from "@shared/schema";

interface Attendee {
  id: string;
  name: string;
  role: Role;
}

interface MeetingSetupFormProps {
  onStartMeeting: (data: {
    title: string;
    attendees: Attendee[];
    durationMinutes: number;
    hasAgenda: boolean;
  }) => void;
}

export default function MeetingSetupForm({ onStartMeeting }: MeetingSetupFormProps) {
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [newAttendeeRole, setNewAttendeeRole] = useState<Role>("Mid");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [hasAgenda, setHasAgenda] = useState(false);

  const estimatedCost = attendees.reduce(
    (sum, att) => sum + (SALARY_BANDS[att.role] / 60) * durationMinutes,
    0
  );

  const handleAddAttendee = () => {
    if (!newAttendeeName.trim()) return;
    
    setAttendees([
      ...attendees,
      {
        id: Math.random().toString(),
        name: newAttendeeName,
        role: newAttendeeRole,
      },
    ]);
    setNewAttendeeName("");
    console.log('Attendee added:', newAttendeeName, newAttendeeRole);
  };

  const handleRemoveAttendee = (id: string) => {
    setAttendees(attendees.filter((a) => a.id !== id));
    console.log('Attendee removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || attendees.length === 0) return;
    
    onStartMeeting({
      title,
      attendees,
      durationMinutes,
      hasAgenda,
    });
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "Junior": return "bg-chart-3 text-white";
      case "Mid": return "bg-chart-1 text-white";
      case "Senior": return "bg-primary text-white";
      case "Manager": return "bg-chart-4 text-white";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Team Sync"
              className="mt-2"
              data-testid="input-meeting-title"
            />
          </div>

          <div>
            <Label>Add Attendees</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newAttendeeName}
                onChange={(e) => setNewAttendeeName(e.target.value)}
                placeholder="Name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
                data-testid="input-attendee-name"
              />
              <Select value={newAttendeeRole} onValueChange={(v) => setNewAttendeeRole(v as Role)}>
                <SelectTrigger className="w-32" data-testid="select-attendee-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SALARY_BANDS).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                size="icon" 
                onClick={handleAddAttendee}
                data-testid="button-add-attendee"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4" data-testid="list-attendees">
                {attendees.map((attendee) => (
                  <Badge
                    key={attendee.id}
                    className={`${getRoleBadgeColor(attendee.role)} pl-3 pr-1 py-1.5 flex items-center gap-2`}
                    data-testid={`badge-attendee-${attendee.name.replace(/\s/g, '-').toLowerCase()}`}
                  >
                    <span className="font-medium">{attendee.name}</span>
                    <span className="text-xs opacity-75">({attendee.role})</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-white/20 no-default-hover-elevate no-default-active-elevate"
                      onClick={() => handleRemoveAttendee(attendee.id)}
                      data-testid={`button-remove-${attendee.name.replace(/\s/g, '-').toLowerCase()}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Scheduled Duration</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setDurationMinutes(Math.max(15, durationMinutes - 15))}
                data-testid="button-decrease-duration"
              >
                -
              </Button>
              <div className="flex items-center gap-2 min-w-[120px] justify-center">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-display font-bold" data-testid="text-duration">
                  {durationMinutes}m
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setDurationMinutes(durationMinutes + 15)}
                data-testid="button-increase-duration"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Label htmlFor="agenda" className="cursor-pointer">Has Agenda?</Label>
              {!hasAgenda && (
                <span className="text-xs text-muted-foreground">
                  (Meetings without agendas are 50% less effective)
                </span>
              )}
            </div>
            <Switch
              id="agenda"
              checked={hasAgenda}
              onCheckedChange={setHasAgenda}
              data-testid="switch-has-agenda"
            />
          </div>

          <Card className="p-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="w-6 h-6 text-destructive" />
                  <span className="text-4xl font-display font-bold text-destructive" data-testid="text-estimated-cost">
                    ${Math.round(estimatedCost)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{attendees.length} attendees</div>
                <div>{durationMinutes} minutes</div>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg"
            disabled={!title.trim() || attendees.length === 0}
            data-testid="button-start-meeting"
          >
            Start Meeting Timer
          </Button>
        </div>
      </Card>
    </form>
  );
}
