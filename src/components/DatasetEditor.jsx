import { useState } from "react";
import { api } from "../services/api";

export default function DatasetEditor({ index, initialData, onSaved, onClose }) {
  const [animal, setAnimal] = useState(initialData?.animal || "");
  const [scene, setScene] = useState(initialData?.scene || "");
  const [story, setStory] = useState(initialData?.story || "");
  const [saving, setSaving] = useState(false);

  const isEdit = index !== undefined;

  async function save() {
    if (!animal.trim() || !scene.trim()) return;
    try {
      setSaving(true);
      const payload = { animal, scene, story };
      if (isEdit) {
        await api.updateDataset(index, payload);
      } else {
        await api.addDataset(payload);
      }
      onSaved?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dataset-modal" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="dataset-form">
        <h3>{isEdit ? "Edit Entry" : "Add Entry"}</h3>

        <div className="form-field">
          <label>Animal</label>
          <input
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            placeholder="e.g. Red Fox"
          />
        </div>

        <div className="form-field">
          <label>Scene</label>
          <input
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            placeholder="e.g. Forest at dusk"
          />
        </div>

        <div className="form-field">
          <label>Story</label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Write the story here…"
          />
        </div>

        <div className="form-actions">
          {onClose && (
            <button className="btn btn-neutral" onClick={onClose}>
              Cancel
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || !animal.trim() || !scene.trim()}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
