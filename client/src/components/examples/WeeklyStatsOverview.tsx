import WeeklyStatsOverview from '../WeeklyStatsOverview';

export default function WeeklyStatsOverviewExample() {
  return (
    <WeeklyStatsOverview
      totalCost={2450}
      totalHours={14.5}
      meetingCount={12}
      averageGrade="B-"
    />
  );
}
