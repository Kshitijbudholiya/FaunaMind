import ImageUploader from "../components/ImageUploader";

export default function UploadPage({ onStoryCreated }) {
  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>FaunaMind</h1>
        <p>Upload an animal photo and let AI craft a story around it.</p>
        <ImageUploader onStoryCreated={onStoryCreated} />
      </div>
    </div>
  );
}
