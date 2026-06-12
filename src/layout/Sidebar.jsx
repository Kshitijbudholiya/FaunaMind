import { Plus, Database } from "lucide-react";

export default function Sidebar({
  sessions,
  openSession,
  currentSession,
  setCurrentSession,
  datasetOpen,
  setDatasetOpen,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🐾</div>
        <span className="sidebar-logo-text">FaunaMind</span>
      </div>

      <button
        className="new-story-btn"
        onClick={() => {
          setCurrentSession(null);
          setDatasetOpen(false);
        }}
      >
        <Plus size={16} />
        New Story
      </button>

      <div className="sidebar-label">Recent Stories</div>

      <div className="session-list">
        {sessions.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 12, padding: "8px 8px" }}>
            No stories yet
          </div>
        )}
        {sessions.map((session) => (
          <button
            key={session.id}
            className={`session-item ${currentSession?.id === session.id && !datasetOpen ? "active" : ""}`}
            onClick={() => {
              setDatasetOpen(false);
              openSession(session.id);
            }}
          >
            <div className="session-title">{session.title}</div>
            <div className="session-meta">{session.animal}</div>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className={`dataset-btn ${datasetOpen ? "active" : ""}`}
          onClick={() => {
            setCurrentSession(null);
            setDatasetOpen(true);
          }}
        >
          <Database size={15} />
          Dataset Viewer
        </button>
      </div>
    </aside>
  );
}
