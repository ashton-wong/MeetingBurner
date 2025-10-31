import MeetingHistoryCard from '../MeetingHistoryCard';

export default function MeetingHistoryCardExample() {
  return (
    <div className="max-w-2xl space-y-4">
      <MeetingHistoryCard
        id="1"
        title="Weekly Team Sync"
        date={new Date(2025, 9, 28, 10, 0)}
        scheduledMinutes={30}
        actualMinutes={45}
        cost={337}
        attendeeCount={5}
        grade="C+"
        gradeDescription="Could've Been Napping"
        onClick={() => console.log('Meeting clicked')}
      />
      <MeetingHistoryCard
        id="2"
        title="Sprint Planning"
        date={new Date(2025, 9, 27, 14, 0)}
        scheduledMinutes={60}
        actualMinutes={55}
        cost={550}
        attendeeCount={6}
        grade="A-"
        gradeDescription="Actually Productive"
        onClick={() => console.log('Meeting clicked')}
      />
    </div>
  );
}
