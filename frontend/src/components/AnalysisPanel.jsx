import React, { useState, useEffect } from 'react'
import { getAnalysis, getClustering, getPredictions } from '../utils/api'
import './AnalysisPanel.css'

function AnalysisPanel({ selectedProtein, onLoadSample }) {
  const [activeTab, setActiveTab] = useState('centrality')
  const [analysisData, setAnalysisData] = useState(null)
  const [clusteringData, setClusteringData] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState('degree')

  useEffect(() => {
    loadAnalysis()
  }, [metric])

  useEffect(() => {
    loadClustering()
    loadPredictions()
  }, [])

  const loadAnalysis = async () => {
    setLoading(true)
    try {
      const data = await getAnalysis(metric)
      setAnalysisData(data)
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadClustering = async () => {
    try {
      const data = await getClustering()
      setClusteringData(data)
    } catch (error) {
      console.error('Error loading clustering:', error)
    }
  }

  const loadPredictions = async () => {
    try {
      const data = await getPredictions()
      setPredictions(data)
    } catch (error) {
      console.error('Error loading predictions:', error)
    }
  }

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h3>Network Analysis</h3>
        <button onClick={onLoadSample} className="load-sample-btn">
          🔬 Load Sample Network
        </button>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'centrality' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('centrality')}
        >
          Centrality
        </button>
        <button
          className={activeTab === 'clustering' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('clustering')}
        >
          Communities
        </button>
        <button
          className={activeTab === 'predictions' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('predictions')}
        >
          Predictions
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'centrality' && (
          <div className="centrality-tab">
            <div className="metric-selector">
              <label>Metric:</label>
              <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                <option value="degree">Degree Centrality</option>
                <option value="betweenness">Betweenness Centrality</option>
                <option value="closeness">Closeness Centrality</option>
                <option value="clustering">Clustering Coefficient</option>
              </select>
            </div>

            {loading ? (
              <div className="loading">Loading analysis...</div>
            ) : analysisData ? (
              <div className="analysis-results">
                <div className="metric-info">
                  <h4>{analysisData.metric}</h4>
                  <p>{analysisData.description}</p>
                </div>
                <div className="results-list">
                  {analysisData.values.slice(0, 15).map((item, idx) => (
                    <div key={idx} className="result-item">
                      <span className="rank">{idx + 1}</span>
                      <span className="protein">{item.protein}</span>
                      <span className="value">{item.value.toFixed(4)}</span>
                      <div className="value-bar" style={{ width: `${(item.value / analysisData.values[0].value) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'clustering' && (
          <div className="clustering-tab">
            {clusteringData ? (
              <>
                <div className="clustering-stats">
                  <div className="stat">
                    <span className="stat-label">Communities:</span>
                    <span className="stat-value">{clusteringData.number_of_communities}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Modularity:</span>
                    <span className="stat-value">{clusteringData.modularity}</span>
                  </div>
                </div>
                <div className="communities-list">
                  {clusteringData.communities.map((community) => (
                    <div key={community.id} className="community-item">
                      <div className="community-header">
                        <span className="community-id">Community {community.id + 1}</span>
                        <span className="community-size">{community.size} proteins</span>
                      </div>
                      <div className="community-proteins">
                        {community.proteins.map((protein, idx) => (
                          <span key={idx} className="protein-tag">{protein}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="loading">Loading clustering data...</div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-tab">
            {predictions ? (
              <>
                <div className="predictions-header">
                  <h4>Predicted Interactions</h4>
                  <span className="prediction-count">Top {predictions.predictions.length} predictions</span>
                </div>
                <div className="predictions-list">
                  {predictions.predictions.map((pred, idx) => (
                    <div key={idx} className="prediction-item">
                      <div className="prediction-proteins">
                        <span className="protein">{pred.protein1}</span>
                        <span className="arrow">→</span>
                        <span className="protein">{pred.protein2}</span>
                      </div>
                      <div className="prediction-details">
                        <span className="score">Score: {pred.score}</span>
                        <span className="reason">{pred.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="loading">Loading predictions...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisPanel

