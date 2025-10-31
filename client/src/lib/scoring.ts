interface ScoreBreakdown {
  label: string;
  points: number;
  reason: string;
}

interface EfficiencyScore {
  grade: string;
  gradeDescription: string;
  score: number;
  breakdown: ScoreBreakdown[];
}

export function calculateEfficiencyScore({
  scheduledMinutes,
  actualMinutes,
  hasAgenda,
  attendeeCount,
}: {
  scheduledMinutes: number;
  actualMinutes: number;
  hasAgenda: boolean;
  attendeeCount: number;
}): EfficiencyScore {
  let score = 100;
  const breakdown: ScoreBreakdown[] = [];

  const isOvertime = actualMinutes > scheduledMinutes;
  const endedEarly = actualMinutes < scheduledMinutes;

  breakdown.push({
    label: "Started on time",
    points: 0,
    reason: "Meeting started as scheduled",
  });

  if (isOvertime) {
    score -= 10;
    breakdown.push({
      label: "Ran over time",
      points: -10,
      reason: `Meeting exceeded scheduled duration by ${actualMinutes - scheduledMinutes} minutes`,
    });
  }

  if (!hasAgenda) {
    score -= 15;
    breakdown.push({
      label: "No agenda",
      points: -15,
      reason: "No agenda was provided for this meeting",
    });
  } else {
    breakdown.push({
      label: "Had agenda",
      points: 0,
      reason: "Meeting had a clear agenda",
    });
  }

  if (attendeeCount > 8) {
    score -= 20;
    breakdown.push({
      label: "Too many attendees",
      points: -20,
      reason: `${attendeeCount} attendees is inefficient for decision-making`,
    });
  }

  if (endedEarly) {
    score += 10;
    breakdown.push({
      label: "Ended early",
      points: 10,
      reason: `Meeting ended ${scheduledMinutes - actualMinutes} minutes early`,
    });
  }

  if (actualMinutes < 30) {
    score += 10;
    breakdown.push({
      label: "Brief meeting",
      points: 10,
      reason: "Meeting was under 30 minutes",
    });
  }

  const grade = 
    score >= 95 ? 'A+' :
    score >= 90 ? 'A' :
    score >= 85 ? 'A-' :
    score >= 80 ? 'B+' :
    score >= 75 ? 'B' :
    score >= 70 ? 'B-' :
    score >= 65 ? 'C+' :
    score >= 60 ? 'C' :
    score >= 55 ? 'C-' :
    score >= 50 ? 'D+' :
    score >= 45 ? 'D' :
    'F';

  const gradeDescription = 
    grade.startsWith('A') ? 'Actually Productive' :
    grade.startsWith('B') ? 'Borderline Acceptable' :
    grade.startsWith('C') ? "Could've Been Napping" :
    grade.startsWith('D') ? 'Time Vortex' :
    'Everyone Could\'ve Been Napping';

  return { grade, gradeDescription, score, breakdown };
}
