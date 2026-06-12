export default function AnalysisCards({ animal, scene }) {
  return (
    <div className="analysis-grid">
      <div className="analysis-card">
        <div className="analysis-card-label">Animal</div>
        <div className="analysis-card-value">{animal}</div>
      </div>
      <div className="analysis-card">
        <div className="analysis-card-label">Scene</div>
        <div className="analysis-card-value">{scene}</div>
      </div>
    </div>
  );
}
