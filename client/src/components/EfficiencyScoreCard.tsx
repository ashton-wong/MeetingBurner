import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, MinusCircle, Award } from "lucide-react";

interface ScoreBreakdown {
  label: string;
  points: number;
  reason: string;
}

interface EfficiencyScoreCardProps {
  grade: string;
  gradeDescription: string;
  totalScore: number;
  breakdown: ScoreBreakdown[];
}

export default function EfficiencyScoreCard({
  grade,
  gradeDescription,
  totalScore,
  breakdown,
}: EfficiencyScoreCardProps) {
  const gradeColor = 
    grade.startsWith('A') ? 'bg-chart-5 text-white' :
    grade.startsWith('B') ? 'bg-chart-3 text-white' :
    grade.startsWith('C') ? 'bg-chart-4 text-white' :
    grade.startsWith('D') ? 'bg-primary text-white' :
    'bg-destructive text-white';

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-4">
          <Award className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-sm text-muted-foreground mb-2">Meeting Efficiency Score</h2>
        <div className={`inline-block ${gradeColor} px-8 py-4 rounded-lg mb-2`}>
          <span className="text-6xl font-display font-bold" data-testid="text-grade">
            {grade}
          </span>
        </div>
        <p className="text-2xl font-semibold mt-2" data-testid="text-grade-description">
          {gradeDescription}
        </p>
        <p className="text-muted-foreground mt-1">
          Final Score: <span className="font-semibold" data-testid="text-total-score">{totalScore}/100</span>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-4">Score Breakdown</h3>
        {breakdown.map((item, index) => {
          const isPositive = item.points > 0;
          const isNeutral = item.points === 0;
          
          return (
            <div key={index} className="flex items-start gap-3" data-testid={`breakdown-item-${index}`}>
              <div className="mt-0.5">
                {isPositive ? (
                  <CheckCircle2 className="w-5 h-5 text-chart-5" />
                ) : isNeutral ? (
                  <MinusCircle className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium">{item.label}</span>
                  <Badge 
                    variant={isPositive ? "default" : "destructive"}
                    className={isPositive ? "bg-chart-5" : ""}
                  >
                    {isPositive ? '+' : ''}{item.points}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Progress value={totalScore} className="h-2" />
      </div>
    </Card>
  );
}
