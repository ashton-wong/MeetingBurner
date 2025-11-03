import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import LiveMeetingTimer from "@/components/LiveMeetingTimer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SALARY_BANDS } from "@shared/schema";
import { Users } from "lucide-react";
import { getMeeting, updateMeeting } from "@/lib/api";
import { calculateEfficiencyScore } from "@/lib/scoring";
import { queryClient } from "@/lib/queryClient";

export default function ActiveMeeting() {
  const [, setLocation] = useLocation();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<{ id: string; title: string; minutes: number }[]>([]);
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [agendaSkipped, setAgendaSkipped] = useState<Record<string, boolean>>({});
  const [agendaElapsedSeconds, setAgendaElapsedSeconds] = useState(0);
  const [agendaTimes, setAgendaTimes] = useState<Record<string, number>>({});
  const [transcript, setTranscript] = useState<string>("");
  const [interim, setInterim] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

    const storedAgenda = localStorage.getItem('meetingAgenda');
    if (storedAgenda) {
      setAgenda(JSON.parse(storedAgenda));
    }

    const storedChecked = localStorage.getItem('meetingAgendaChecked');
    if (storedChecked) {
      setCheckedIds(JSON.parse(storedChecked));
    }
    const storedTimes = localStorage.getItem('meetingAgendaTimes');
    if (storedTimes) {
      setAgendaTimes(JSON.parse(storedTimes));
    }
    const storedSkipped = localStorage.getItem('meetingAgendaSkipped');
    if (storedSkipped) {
      setAgendaSkipped(JSON.parse(storedSkipped));
    }
  }, [setLocation]);

  // agenda item timer: counts seconds for the current agenda item
  useEffect(() => {
    const interval = setInterval(() => {
      setAgendaElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // setup microphone permission and speech recognition (if available)
  useEffect(() => {
    let mounted = true;

    async function startRecognition() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        setIsRecording(true);

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setTranscript((t) => t + ' (speech recognition not supported in this browser)');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimText = '';
          let finalText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) finalText += res[0].transcript + ' ';
            else interimText += res[0].transcript + ' ';
          }

          // Show live interim results but only persist final results to the transcript
          if (finalText.trim()) {
            setTranscript((prev) => (prev + ' ' + finalText).trim());
            // clear interim after final appended
            setInterim('');
          } else {
            // update interim live display
            setInterim(interimText.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error', e);
        };

        recognition.onend = () => {
          // Restart recognition automatically during an active meeting to avoid
          // it stopping after a period of silence. `mounted` will be false when
          // the component is unmounted or when we explicitly stop recognition.
          if (mounted) {
            try {
              recognition.start();
            } catch (e) {
              // if restart fails, mark not recording
              setIsRecording(false);
            }
          } else {
            setIsRecording(false);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Microphone permission denied or error', err);
      }
    }

    startRecognition();

    return () => {
      mounted = false;
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
      } catch (e) {}
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
        setInterim('');
    };
  }, []);

  // find the next (first unchecked) agenda item to measure progress against
  const currentAgendaIndex = agenda.findIndex((it) => !checkedIds[it.id]);
  const currentAgendaItem = currentAgendaIndex >= 0 ? agenda[currentAgendaIndex] : undefined;
  const currentAgendaTotalSeconds = currentAgendaItem ? currentAgendaItem.minutes * 60 : 1;
  const currentAgendaProgress = Math.min(1, agendaElapsedSeconds / currentAgendaTotalSeconds);
  const currentAgendaOverRatio = currentAgendaItem ? agendaElapsedSeconds / currentAgendaTotalSeconds : 0;

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
    // Stop speech recognition explicitly when ending the meeting so it doesn't restart
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (e) {}
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setInterim('');
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

    // build meeting report including per-agenda analysis
    const attendeesStored = localStorage.getItem('meetingAttendees');
    const attendeesList = attendeesStored ? JSON.parse(attendeesStored) : [];

    const agendaReport = agenda.map((item) => {
      const actualSeconds = agendaTimes[item.id] ?? 0;
      const allottedSeconds = item.minutes * 60;
      const skipped = agendaSkipped[item.id] ?? false;
      const ratio = allottedSeconds > 0 ? actualSeconds / allottedSeconds : 0;
      const burnedSeconds = Math.max(0, actualSeconds - allottedSeconds);
      const burnedCash = burnedSeconds * costPerSecond;

      return {
        id: item.id,
        title: item.title,
        allottedSeconds,
        actualSeconds,
        skipped,
        ratio,
        burnedCash: Math.round(burnedCash * 100) / 100,
      };
    });

    // persist recommendations for future meetings
    const recKey = 'agendaRecommendations';
    const existingRec = JSON.parse(localStorage.getItem(recKey) || '[]') as string[];
    const newRecs = new Set(existingRec);
    agendaReport.forEach((ar) => {
      if (ar.ratio < 0.5) newRecs.add(ar.title);
    });
    localStorage.setItem(recKey, JSON.stringify(Array.from(newRecs)));

    // compute per-agenda penalties (negative points) for overruns
    const agendaPenalties = agendaReport.map((ar) => {
      let points = 0;
      let reason = '';
      if (ar.skipped) {
        // penalize skipped items with a small negative score
        points = -5;
        reason = 'Marked skipped';
      } else if (ar.ratio > 1) {
        points = -Math.ceil((ar.ratio - 1) * 10);
        reason = `Took ${Math.round(ar.actualSeconds/60)}m vs ${Math.round(ar.allottedSeconds/60)}m`;
      }
      return { id: ar.id, title: ar.title, points, reason };
    });

    const penaltyTotal = agendaPenalties.reduce((s, p) => s + p.points, 0);

    // Merge penalties into the breakdown and adjust final score
    const finalBreakdown = [...score.breakdown];
    agendaPenalties.forEach((p) => {
      if (p.points < 0) {
        finalBreakdown.push({ label: `Agenda: ${p.title}`, points: p.points, reason: p.reason });
      }
    });

    const finalScoreValue = score.score + penaltyTotal;

    // recompute grade/description from finalScoreValue (same logic as scoring)
    const finalGrade = 
      finalScoreValue >= 95 ? 'A+' :
      finalScoreValue >= 90 ? 'A' :
      finalScoreValue >= 85 ? 'A-' :
      finalScoreValue >= 80 ? 'B+' :
      finalScoreValue >= 75 ? 'B' :
      finalScoreValue >= 70 ? 'B-' :
      finalScoreValue >= 65 ? 'C+' :
      finalScoreValue >= 60 ? 'C' :
      finalScoreValue >= 55 ? 'C-' :
      finalScoreValue >= 50 ? 'D+' :
      finalScoreValue >= 45 ? 'D' :
      'F';

    const finalGradeDescription = 
      finalGrade.startsWith('A') ? 'Actually Productive' :
      finalGrade.startsWith('B') ? 'Borderline Acceptable' :
      finalGrade.startsWith('C') ? "Could've Been Napping" :
      finalGrade.startsWith('D') ? 'Time Vortex' :
      'Everyone Could\'ve Been Napping';

    const results = {
      title: meeting.title,
      score: finalScoreValue,
      grade: finalGrade,
      gradeDescription: finalGradeDescription,
      breakdown: finalBreakdown,
      totalCost,
      // include startedAt from the server meeting if available so Dashboard can show correct timestamps
      startedAt: meeting.startedAt || new Date(),
      durationMinutes: meeting.scheduledDurationMinutes,
      actualMinutes,
      attendees: attendeesList,
      hasAgenda: meeting.hasAgenda,
      agendaReport,
      transcript,
    };

    localStorage.setItem('lastMeetingResult', JSON.stringify(results));
    // also persist report by meeting id so past meetings can be opened from dashboard
    try {
      localStorage.setItem(`meetingReport:${meetingId}`, JSON.stringify(results));
    } catch (e) {
      // ignore quota errors
      console.warn('Failed to persist meeting report by id', e);
    }

    // cleanup transient meeting state
    localStorage.removeItem('activeMeetingId');
    localStorage.removeItem('meetingAttendees');
    localStorage.removeItem('meetingAgenda');
    localStorage.removeItem('meetingAgendaChecked');
    localStorage.removeItem('meetingAgendaTimes');

    // navigate to results page
    setLocation('/results');
  };

  return (
    <div className={`min-h-screen bg-background ${currentAgendaOverRatio >= 2 ? 'pulse-red' : ''}`}>
      <style>{`
        /* Much stronger red pulse: alternating brighter/darker overlay using inset shadow and a pseudo-element */
        .pulse-red { position: relative; animation: pulseRed 900ms infinite ease-in-out; }
        .pulse-red::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 60;
          background: radial-gradient(circle at 30% 20%, rgba(255,99,71,0.18), rgba(139,0,0,0.28));
          mix-blend-mode: overlay;
          opacity: 1;
        }
        @keyframes pulseRed {
          0% { box-shadow: inset 0 0 0 0 rgba(220,38,38,0.12); }
          40% { box-shadow: inset 0 0 0 9999px rgba(220,38,38,0.36); }
          70% { box-shadow: inset 0 0 0 9999px rgba(255,69,58,0.45); }
          100% { box-shadow: inset 0 0 0 0 rgba(220,38,38,0.12); }
        }
      `}</style>
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

        {agenda.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="font-semibold mb-4">Agenda</h3>

            <div className="mb-4 flex items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Current agenda timer</div>
                <div className="text-2xl font-mono font-bold">{Math.floor(agendaElapsedSeconds / 60)}:{(agendaElapsedSeconds % 60).toString().padStart(2, '0')}</div>
              </div>

              {/* Horizontal candle progress visual */}
              <div className="flex items-center gap-4" aria-hidden>
                {/* flame + wick */}
                <div className="flex items-center">
                  {/* Inline flame SVG with flicker animation */}
                  <svg
                    className="flame"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#FFFBEB" />
                        <stop offset="60%" stopColor="#FDBA74" />
                        <stop offset="100%" stopColor="#FB923C" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2C10 5 8 6 8 9C8 12 11 14 11 16C11 18 10 20 10 20H14C14 20 13 18 13 16C13 14 16 12 16 9C16 6 14 5 12 2Z" fill="url(#g1)" />
                  </svg>

                  {/* wick */}
                  <div className="w-0.5 h-6 bg-neutral-700 ml-1 mr-2 rounded" />
                </div>

                {/* horizontal candle body */}
                <div className="relative w-64 h-8 bg-neutral-200 rounded-md overflow-hidden shadow-inner">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-amber-400"
                    style={{
                      width: `${Math.max(0, (1 - currentAgendaProgress) * 100)}%`,
                      transition: 'width 0.4s linear',
                    }}
                  />
                  {/* subtle overlay to make the candle look waxy */}
                  <div className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-b from-transparent to-white/20 pointer-events-none" />
                </div>
              </div>

              {/* flame animation CSS (scoped inline) */}
              <style>{`
                .flame { animation: flicker 900ms infinite; transform-origin: center bottom; }
                @keyframes flicker {
                  0% { transform: translateY(0) scale(1); opacity: 1; }
                  50% { transform: translateY(-1px) scale(1.03); opacity: 0.9; }
                  100% { transform: translateY(0) scale(1); opacity: 1; }
                }
              `}</style>
            </div>

            <div className="space-y-3">
              {agenda.map((item, idx) => {
                const prevDone = idx === 0 || agenda.slice(0, idx).every((a) => checkedIds[a.id]);
                const isCurrent = currentAgendaItem?.id === item.id;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!checkedIds[item.id]}
                        disabled={!prevDone}
                        onChange={(e) => {
                          if (!prevDone) return; // prevent checking out-of-order
                          const isChecked = e.target.checked;
                          const next = { ...checkedIds, [item.id]: isChecked };
                          setCheckedIds(next);
                          localStorage.setItem('meetingAgendaChecked', JSON.stringify(next));

                          if (isChecked) {
                            // record how long this agenda item took (seconds)
                            const nextTimes = { ...agendaTimes, [item.id]: agendaElapsedSeconds };
                            setAgendaTimes(nextTimes);
                            localStorage.setItem('meetingAgendaTimes', JSON.stringify(nextTimes));
                            // reset timer for next item
                            setAgendaElapsedSeconds(0);
                          } else {
                            // if unchecked, remove recorded time
                            const { [item.id]: _removed, ...rest } = agendaTimes;
                            setAgendaTimes(rest);
                            localStorage.setItem('meetingAgendaTimes', JSON.stringify(rest));
                          }
                        }}
                        className="h-4 w-4"
                        data-testid={`checkbox-agenda-${item.id}`}
                      />
                      <div>
                        <div className={`font-medium ${checkedIds[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </div>
                        <div className="text-sm text-muted-foreground">{item.minutes} min</div>
                        {agendaTimes[item.id] !== undefined && (
                          <div className="text-xs text-muted-foreground">Took {Math.floor(agendaTimes[item.id] / 60)}:{(agendaTimes[item.id] % 60).toString().padStart(2, '0')}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!checkedIds[item.id] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Skip this item: mark done and record 0s, and persist a skipped flag
                            const next = { ...checkedIds, [item.id]: true };
                            setCheckedIds(next);
                            localStorage.setItem('meetingAgendaChecked', JSON.stringify(next));
                            const nextTimes = { ...agendaTimes, [item.id]: 0 };
                            setAgendaTimes(nextTimes);
                            localStorage.setItem('meetingAgendaTimes', JSON.stringify(nextTimes));
                            const nextSkipped = { ...agendaSkipped, [item.id]: true };
                            setAgendaSkipped(nextSkipped);
                            localStorage.setItem('meetingAgendaSkipped', JSON.stringify(nextSkipped));
                            // reset timer for next item
                            setAgendaElapsedSeconds(0);
                          }}
                        >
                          Skip
                        </Button>
                      )}
                      {checkedIds[item.id] && (
                        agendaSkipped[item.id] ? <Badge variant="destructive">Skipped</Badge> : <Badge>Done</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Live transcription panel */}
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Live Transcription</h3>
            <div className="text-sm text-muted-foreground">
              {isRecording ? 'Recording 🎙️' : 'Not recording'}
            </div>
          </div>
          <div className="text-sm text-muted-foreground max-h-48 overflow-auto whitespace-pre-wrap">
            {transcript ? (
              <div className="whitespace-pre-wrap">{transcript}</div>
            ) : (
              <div className="text-muted-foreground">{isRecording ? 'Listening…' : 'No transcript'}</div>
            )}

            {interim && (
              <div className="mt-2 text-sm text-foreground/70 italic">{interim}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
