import { BookOpen } from "lucide-react";

export default function StoryViewer({ title, story }) {
  return (
    <div className="story-card">
      <div className="card-header">
        <div className="card-icon green">
          <BookOpen size={14} />
        </div>
        <h2>{title}</h2>
      </div>
      <div className="story-content">{story}</div>
    </div>
  );
}
