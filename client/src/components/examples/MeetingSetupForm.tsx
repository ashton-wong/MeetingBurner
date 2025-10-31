import MeetingSetupForm from '../MeetingSetupForm';

export default function MeetingSetupFormExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <MeetingSetupForm
        onStartMeeting={(data) => {
          console.log('Meeting started with:', data);
          alert(`Meeting "${data.title}" started with ${data.attendees.length} attendees!`);
        }}
      />
    </div>
  );
}
