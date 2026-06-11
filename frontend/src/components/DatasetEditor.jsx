import { useState } from "react";

import { api } from "../services/api";

export default function DatasetEditor({
  index,
  initialData,
  onSaved,
  onClose,
}) {
  const [animal, setAnimal] = useState(initialData?.animal || "");

  const [scene, setScene] = useState(initialData?.scene || "");

  const [story, setStory] = useState(initialData?.story || "");

  async function save() {
    try {
      const payload = {
        animal,
        scene,
        story,
      };

      if (index !== undefined) {
        await api.updateDataset(index, payload);
      } else {
        await api.addDataset(payload);
      }

      onSaved?.();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dataset-modal">
      <div className="dataset-form">
        <h3>{index !== undefined ? "Edit Dataset" : "Add Dataset"}</h3>

        <input
          value={animal}
          onChange={(e) => setAnimal(e.target.value)}
          placeholder="Animal"
        />

        <input
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          placeholder="Scene"
        />

        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Story"
        />

        <div className="form-actions">
          <button onClick={save}>Save</button>

          {onClose && <button onClick={onClose}>Cancel</button>}
        </div>
      </div>
    </div>
  );
}
