import AnalysisCards from "../components/AnalysisCards";
import StoryViewer from "../components/StoryViewer";
import ChatPanel from "../components/ChatPanel";

export default function StoryPage({ session, setSession, refreshSessions }) {
  return (
    <div className="story-page">
      <div className="story-header">
        <img
          className="story-image"
          src={`data:image/png;base64,${session.image_b64}`}
          alt={session.animal || "Animal photo"}
        />
      </div>

      <AnalysisCards animal={session.animal} scene={session.scene} />

      <StoryViewer title={session.title} story={session.story} />

      <ChatPanel
        session={session}
        setSession={setSession}
        refreshSessions={refreshSessions}
      />
    </div>
  );
}
