import { Plus } from "lucide-react";

export default function Sidebar({
  sessions,
  openSession,
  setCurrentSession,
  datasetOpen,
  setDatasetOpen,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button
          className="new-story-btn"
          onClick={() => {
            setCurrentSession(null);

            setDatasetOpen(false);
          }}
        >
          <Plus size={18} />
          New Story
        </button>
      </div>

      <div className="sidebar-section">
        <h3>Chats</h3>

        <div className="session-list">
          {sessions.map((session) => (
            <button
              key={session.id}
              className="session-item"
              onClick={() => openSession(session.id)}
            >
              <div>{session.title}</div>

              <small>{session.animal}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Dataset</h3>

        <button
          className="dataset-btn"
          onClick={() => {
            setCurrentSession(null);

            setDatasetOpen(true);
          }}
        >
          Dataset Viewer
        </button>
      </div>
    </aside>
  );
}
