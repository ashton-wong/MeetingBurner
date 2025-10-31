import EfficiencyScoreCard from '../EfficiencyScoreCard';

export default function EfficiencyScoreCardExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <EfficiencyScoreCard
        grade="C+"
        gradeDescription="Could've Been Napping"
        totalScore={65}
        breakdown={[
          { label: "Started on time", points: 0, reason: "Meeting started as scheduled" },
          { label: "Ran over time", points: -10, reason: "Meeting exceeded scheduled duration by 15 minutes" },
          { label: "No agenda", points: -15, reason: "No agenda was provided for this meeting" },
          { label: "Too many attendees", points: -10, reason: "8 attendees is inefficient for decision-making" },
          { label: "Under 60 minutes", points: 0, reason: "Meeting was within acceptable length" },
        ]}
      />
    </div>
  );
}
