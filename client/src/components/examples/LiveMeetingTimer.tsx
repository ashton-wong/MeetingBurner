import LiveMeetingTimer from '../LiveMeetingTimer';

export default function LiveMeetingTimerExample() {
  return (
    <div className="max-w-4xl mx-auto">
      <LiveMeetingTimer
        scheduledMinutes={30}
        costPerSecond={1.25}
        onEndMeeting={(minutes, cost) => {
          console.log('Meeting ended:', { minutes, cost });
          alert(`Meeting ended after ${minutes} minutes, costing $${cost.toFixed(2)}`);
        }}
      />
    </div>
  );
}
