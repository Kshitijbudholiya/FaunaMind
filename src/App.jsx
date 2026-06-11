import { useEffect, useState } from "react";

import Sidebar from "./layout/Sidebar";

import UploadPage from "./pages/UploadPage";
import StoryPage from "./pages/StoryPage";
import { api } from "./services/api";

import "./styles/globals.css";
import "./styles/layout.css";

import DatasetViewer from "./components/DatasetViewer";

function App() {
  const [sessions, setSessions] = useState([]);

  const [currentSession, setCurrentSession] = useState(null);

  const [datasetOpen, setDatasetOpen] = useState(false);

  async function refreshSessions() {
    try {
      const data = await api.getSessions();

      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function openSession(id) {
    try {
      const session = await api.getSession(id);

      setCurrentSession(session);
      setDatasetOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    refreshSessions();
  }, []);

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        refreshSessions={refreshSessions}
        openSession={openSession}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        datasetOpen={datasetOpen}
        setDatasetOpen={setDatasetOpen}
      />

      <main className="main">
        {datasetOpen ? (
          <DatasetViewer />
        ) : currentSession ? (
          <StoryPage
            session={currentSession}
            setSession={setCurrentSession}
            refreshSessions={refreshSessions}
          />
        ) : (
          <UploadPage
            onStoryCreated={async (session) => {
              setCurrentSession(session);
              await refreshSessions();
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
