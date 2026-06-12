import { useState } from "react";
import { Upload } from "lucide-react";
import { api } from "../services/api";

export default function ImageUploader({ onStoryCreated }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(file) {
    if (!file) return;
    try {
      setLoading(true);
      const upload = await api.uploadImage(file);
      const story = await api.startStory({ image_b64: upload.image_b64 });
      onStoryCreated(story);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUrl() {
    if (!url.trim()) return;
    try {
      setLoading(true);
      const image = await api.imageFromUrl(url);
      const story = await api.startStory({ image_b64: image.image_b64 });
      onStoryCreated(story);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-card">
      <label className="upload-box">
        <Upload size={36} />
        <span>Click to select an image</span>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={loading}
        />
      </label>

      <div className="divider">or paste a URL</div>

      <div className="url-upload">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/animal.jpg"
          onKeyDown={(e) => e.key === "Enter" && handleUrl()}
          disabled={loading}
        />
        <button onClick={handleUrl} disabled={loading || !url.trim()}>
          {loading ? "Loading…" : "Analyze"}
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Analyzing image…
        </div>
      )}
    </div>
  );
}
