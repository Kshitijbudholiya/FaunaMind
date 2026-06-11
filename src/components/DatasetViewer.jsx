import { useEffect, useState } from "react";

import { api } from "../services/api";

import DatasetEditor from "./DatasetEditor";

export default function DatasetViewer() {
  const [rows, setRows] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);

  const [editingRow, setEditingRow] = useState(null);

  async function loadDataset() {
    try {
      const data = await api.getDataset();

      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteRow(index) {
    if (!window.confirm("Delete entry?")) return;

    await api.deleteDataset(index);

    loadDataset();
  }

  useEffect(() => {
    loadDataset();
  }, []);

  return (
    <div className="dataset-viewer">
      <div className="dataset-header">
        <h2>Dataset</h2>

        <DatasetEditor onSaved={loadDataset} />
      </div>

      <div className="dataset-table">
        {rows.map((row, index) => (
          <div key={index} className="dataset-row">
            <div>
              <strong>Animal:</strong> {row.animal}
            </div>

            <div>
              <strong>Scene:</strong> {row.scene}
            </div>

            <div className="story-preview">{row.story}</div>

            <div className="dataset-actions">
              <button
                onClick={() => {
                  setEditingIndex(index);

                  setEditingRow(row);
                }}
              >
                Edit
              </button>

              <button onClick={() => deleteRow(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editingRow && (
        <DatasetEditor
          index={editingIndex}
          initialData={editingRow}
          onClose={() => setEditingRow(null)}
          onSaved={() => {
            setEditingRow(null);

            loadDataset();
          }}
        />
      )}
    </div>
  );
}
