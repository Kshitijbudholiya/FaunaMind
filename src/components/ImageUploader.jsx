import { useState } from "react";
import { Upload } from "lucide-react";

import { api } from "../services/api";

export default function ImageUploader({ onStoryCreated }) {
  const [loading, setLoading] = useState(false);

  const [url, setUrl] = useState("");

  async function handleFile(file) {
    try {
      setLoading(true);

      const upload = await api.uploadImage(file);

      const story = await api.startStory({
        image_b64: upload.image_b64,
      });

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

      const story = await api.startStory({
        image_b64: image.image_b64,
      });

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
        <Upload size={40} />

        <span>Select Image</span>

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      <div className="divider">OR</div>

      <div className="url-upload">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Image URL"
        />

        <button onClick={handleUrl} disabled={loading}>
          Upload
        </button>
      </div>

      {loading && <div className="loading">Analyzing image...</div>}
    </div>
  );
}
