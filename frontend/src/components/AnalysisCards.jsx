export default function AnalysisCards({ animal, scene }) {
  return (
    <div className="analysis-grid">
      <div className="analysis-card">
        <h3>Animal</h3>

        <p>{animal}</p>
      </div>

      <div className="analysis-card">
        <h3>Scene</h3>

        <p>{scene}</p>
      </div>
    </div>
  );
}
