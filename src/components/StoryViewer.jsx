export default function StoryViewer({ title, story }) {
  return (
    <div className="story-card">
      <h2>{title}</h2>

      <div className="story-content">{story}</div>
    </div>
  );
}
