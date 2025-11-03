import { Card } from "@/components/ui/card";
import { DollarSign, Clock, TrendingDown, Award } from "lucide-react";

interface WeeklyStatsProps {
  totalCost: number;
  totalHours: number;
  meetingCount: number;
  averageGrade: string;
  potentialSavings?: number;
}

export default function WeeklyStatsOverview({
  totalCost,
  totalHours,
  meetingCount,
  averageGrade,
  potentialSavings,
}: WeeklyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6" data-testid="card-total-cost">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Burn</p>
            <p className="text-3xl font-display font-bold mt-1">
              ${totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </div>
          <div className="p-2 bg-destructive/10 rounded-md">
            <DollarSign className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </Card>

      <Card className="p-6" data-testid="card-total-hours">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Meeting Time</p>
            <p className="text-3xl font-display font-bold mt-1">
              {totalHours.toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">{meetingCount} meetings</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            <Clock className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6" data-testid="card-efficiency">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Avg. Efficiency</p>
            <p className="text-3xl font-display font-bold mt-1">
              {averageGrade}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Grade average</p>
          </div>
          <div className="p-2 bg-chart-3/10 rounded-md">
            <Award className="w-5 h-5 text-chart-3" />
          </div>
        </div>
      </Card>

      <Card className="p-6" data-testid="card-potential-savings">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Potential Savings</p>
            <p className="text-3xl font-display font-bold mt-1">
              ${((potentialSavings ?? Math.round(totalCost * 0.3))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Estimated based on agenda analysis</p>
          </div>
          <div className="p-2 bg-chart-5/10 rounded-md">
            <TrendingDown className="w-5 h-5 text-chart-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
