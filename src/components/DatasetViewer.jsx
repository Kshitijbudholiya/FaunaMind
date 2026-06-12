import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../services/api";
import DatasetEditor from "./DatasetEditor";

export default function DatasetViewer() {
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  async function loadDataset() {
    try {
      const data = await api.getDataset();
      setRows(data.rows || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteRow(index) {
    if (!window.confirm("Delete this entry?")) return;
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
        <button className="btn btn-primary" onClick={() => setAddingNew(true)}>
          <Plus size={14} />
          Add Entry
        </button>
      </div>

      <div className="dataset-table">
        {rows.length === 0 && (
          <div className="dataset-empty">No entries yet. Add one to get started.</div>
        )}
        {rows.map((row, index) => (
          <div key={index} className="dataset-row">
            <div className="dataset-row-fields">
              <div className="dataset-field">
                <div className="dataset-field-label">Animal</div>
                <div className="dataset-field-value">{row.animal}</div>
              </div>
              <div className="dataset-field">
                <div className="dataset-field-label">Scene</div>
                <div className="dataset-field-value">{row.scene}</div>
              </div>
            </div>

            {row.story && (
              <div className="story-preview">{row.story}</div>
            )}

            <div className="dataset-actions">
              <button
                className="btn btn-neutral"
                onClick={() => {
                  setEditingIndex(index);
                  setEditingRow(row);
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteRow(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {addingNew && (
        <DatasetEditor
          onClose={() => setAddingNew(false)}
          onSaved={() => {
            setAddingNew(false);
            loadDataset();
          }}
        />
      )}

      {editingRow && (
        <DatasetEditor
          index={editingIndex}
          initialData={editingRow}
          onClose={() => {
            setEditingRow(null);
            setEditingIndex(null);
          }}
          onSaved={() => {
            setEditingRow(null);
            setEditingIndex(null);
            loadDataset();
          }}
        />
      )}
    </div>
  );
}
