import React, { useState, useEffect } from 'react'
import NetworkGraph from './components/NetworkGraph'
import AnalysisPanel from './components/AnalysisPanel'
import { getNetwork, getProteinDetails } from './utils/api'
import './App.css'

function App() {
  const [networkData, setNetworkData] = useState(null)
  const [selectedProtein, setSelectedProtein] = useState(null)
  const [proteinDetails, setProteinDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNetwork()
  }, [])

  useEffect(() => {
    if (selectedProtein) {
      loadProteinDetails(selectedProtein)
    }
  }, [selectedProtein])

  const loadNetwork = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getNetwork()
      setNetworkData(data)
    } catch (err) {
      setError('Failed to load network. Make sure the backend is running on port 8000.')
      console.error('Error loading network:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadProteinDetails = async (proteinName) => {
    try {
      const details = await getProteinDetails(proteinName)
      setProteinDetails(details)
    } catch (err) {
      console.error('Error loading protein details:', err)
    }
  }

  const handleNodeSelect = (proteinName) => {
    setSelectedProtein(proteinName)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading protein interaction network...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-screen">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={loadNetwork} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>🧬 BioGraph Explorer</h1>
          <p>This is a simple yet powerful web-based visualizer for protein-protein interaction networks. This tool helps researchers and students explore biological networks through interactive graph visualization, AI-powered community detection, and network analysis algorithms. Built with React for the frontend and FastAPI with NetworkX for graph processing, it provides an intuitive way to understand complex protein relationships and predict potential interactions.</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {networkData && (
            <>
              <div className="network-stats">
                <div className="stat-card">
                  <div className="stat-label">Proteins</div>
                  <div className="stat-value">{networkData.stats.total_nodes}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Interactions</div>
                  <div className="stat-value">{networkData.stats.total_edges}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Network Density</div>
                  <div className="stat-value">{networkData.stats.density}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Degree</div>
                  <div className="stat-value">{networkData.stats.average_degree}</div>
                </div>
              </div>

              <div className="main-content">
                <div className="graph-section">
                  <div className="section-header">
                    <h2>Network Visualization</h2>
                    {selectedProtein && (
                      <div className="selected-protein">
                        Selected: <strong>{selectedProtein}</strong>
                      </div>
                    )}
                  </div>
                  <NetworkGraph
                    nodes={networkData.nodes}
                    edges={networkData.edges}
                    onNodeSelect={handleNodeSelect}
                  />
                </div>

                <div className="sidebar">
                  <AnalysisPanel
                    selectedProtein={selectedProtein}
                    onLoadSample={loadNetwork}
                  />

                  {proteinDetails && (
                    <div className="protein-details-panel">
                      <h3>Protein Details</h3>
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">Protein:</span>
                          <span className="detail-value">{proteinDetails.protein}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Family:</span>
                          <span className="detail-value">{proteinDetails.family}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Degree:</span>
                          <span className="detail-value">{proteinDetails.degree}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Clustering:</span>
                          <span className="detail-value">{proteinDetails.clustering_coefficient}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Neighbors ({proteinDetails.neighbors.length}):</span>
                          <div className="neighbors-list">
                            {proteinDetails.neighbors.map((neighbor, idx) => (
                              <span key={idx} className="neighbor-tag">{neighbor}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

