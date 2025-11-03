import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Flame, Music, StopCircle } from "lucide-react";
import burningMoneyImg from "@assets/generated_images/Burning_dollar_bill_pixel_art_da58f5c7.png";

interface LiveMeetingTimerProps {
  scheduledMinutes: number;
  costPerSecond: number;
  onEndMeeting: (actualMinutes: number, totalCost: number) => void;
}

export default function LiveMeetingTimer({
  scheduledMinutes,
  costPerSecond,
  onEndMeeting,
}: LiveMeetingTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    a.loop = true;
    return a;
  });

  const [halloween, setHalloween] = useState(false);

  useEffect(() => {
    setHalloween(document.documentElement.classList.contains('halloween'));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const displaySeconds = elapsedSeconds % 60;
  const totalCost = elapsedSeconds * costPerSecond;
  const isOvertime = elapsedMinutes > scheduledMinutes;
  const isDoubleOvertime = elapsedMinutes >= scheduledMinutes * 2;

  const handlePlayMusic = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
    console.log('Yakety Sax toggled:', !isPlaying);
  };

  const handleEndMeeting = () => {
    audio.pause();
    const actualMinutes = Math.ceil(elapsedSeconds / 60);
    onEndMeeting(actualMinutes, totalCost);
  };

  return (
    <div className="space-y-8">
      <Card className="p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-primary/5" />
        
        <div className="relative z-10 text-center space-y-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Money Burned</p>
            <div className="flex items-center justify-center gap-4">
              {halloween ? (
                <div className="w-16 h-16 flex items-center justify-center text-4xl">🎃</div>
              ) : (
                <img 
                  src={burningMoneyImg} 
                  alt="Burning money"
                  className="w-16 h-16 animate-pulse"
                />
              )}
              <div className="text-7xl font-display font-bold text-destructive tabular-nums" data-testid="text-live-cost">
                ${totalCost.toFixed(2)}
              </div>
              {halloween ? (
                <div className="w-16 h-16 flex items-center justify-center text-4xl">🎃</div>
              ) : (
                <img 
                  src={burningMoneyImg} 
                  alt="Burning money"
                  className="w-16 h-16 animate-pulse"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Elapsed Time</p>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-6 h-6 text-muted-foreground" />
                <span className={`text-4xl font-display font-bold tabular-nums ${isOvertime ? 'text-destructive' : ''}`} data-testid="text-elapsed-time">
                  {elapsedMinutes}:{displaySeconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="w-px h-12 bg-border" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Scheduled End</p>
              <div className="flex items-center gap-2 justify-center">
                <Clock className="w-6 h-6 text-muted-foreground" />
                <span className="text-4xl font-display font-bold tabular-nums" data-testid="text-scheduled-time">
                  {scheduledMinutes}:00
                </span>
              </div>
            </div>
          </div>

          {isOvertime && (
            <Badge variant="destructive" className="text-base px-4 py-2" data-testid="badge-overtime">
              <Flame className="w-4 h-4 mr-2" />
              {isDoubleOvertime ? 'WAY OVER TIME!' : 'OVER TIME!'}
            </Badge>
          )}
        </div>
      </Card>

      {isDoubleOvertime && (
        <Card className="p-6 bg-primary/10 border-primary" data-testid="card-yakety-sax">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">Uh oh, we've gone full overtime!</p>
                <p className="text-sm text-muted-foreground">
                  This meeting has run 2x over schedule. Time for some mood music?
                </p>
              </div>
            </div>
            <Button 
              onClick={handlePlayMusic}
              variant={isPlaying ? "destructive" : "default"}
              data-testid="button-play-music"
            >
              {isPlaying ? 'Stop Music' : 'Play Yakety Sax'}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          size="lg"
          variant="destructive"
          onClick={handleEndMeeting}
          className="text-lg px-8"
          data-testid="button-end-meeting"
        >
          <StopCircle className="w-5 h-5 mr-2" />
          End Meeting
        </Button>
      </div>
    </div>
  );
}
