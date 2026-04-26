export function SimulationLab({ scenario, selectedScenarioId, onScenarioChange, onRun }) {
  return (
    <div className="simulation card wide-card" id="simulation" data-reveal>
      <div>
        <h3>What If Simulation Lab</h3>
        <p>See the impact of your choices</p>
        <select value={selectedScenarioId} onChange={(event) => onScenarioChange(event.target.value)}>
          <option value="ev_adoption_30">What if 30% of Delhi used EVs?</option>
          <option value="metro_shift_20">What if 20% of cab rides shifted to metro?</option>
          <option value="urban_trees_100k">What if 100k trees were planted?</option>
        </select>
        <button onClick={onRun}>Run Simulation</button>
      </div>
      <div className="sim-results">
        <span>Potential Impact (1 Year)</span>
        <div>
          <b>{(scenario.co2_reduced_kg / 1000000).toFixed(1)} <small>Million kg</small></b>
          <p>CO₂ Reduced</p>
        </div>
        <div>
          <b>{scenario.aqi_improvement_percent}%</b>
          <p>AQI Improvement</p>
        </div>
        <div>
          <b>{scenario.temp_reduction_c}°C</b>
          <p>Temp Reduction</p>
        </div>
      </div>
    </div>
  );
}
