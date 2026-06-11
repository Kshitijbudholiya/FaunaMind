import json
import os
from datetime import datetime

SESSIONS_DIR = "data/sessions"

os.makedirs(SESSIONS_DIR, exist_ok=True)

def session_path(session_id):
    return os.path.join(SESSIONS_DIR, f"{session_id}.json")

def save_session(session):
    session["updated_at"] = datetime.utcnow().isoformat()
    with open(session_path(session["id"]), "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2)

def load_session(session_id):
    path = session_path(session_id)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def delete_session(session_id):
    path = session_path(session_id)
    if os.path.exists(path):
        os.remove(path)

def list_sessions():
    sessions = []
    for file in os.listdir(SESSIONS_DIR):
        if file.endswith(".json"):
            with open(os.path.join(SESSIONS_DIR, file), "r", encoding="utf-8") as f:
                sessions.append(json.load(f))
    sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return sessions
