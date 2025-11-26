import React, { useEffect, useRef, useState } from 'react'
import { Network } from 'vis-network'
import './NetworkGraph.css'

function NetworkGraph({ nodes, edges, onNodeSelect }) {
  const networkRef = useRef(null)
  const containerRef = useRef(null)
  const [network, setNetwork] = useState(null)

  const getNodeColor = (degree) => {
    if (degree >= 10) return '#FF4444' // Red - highly connected
    if (degree >= 7) return '#FF8800'  // Orange
    if (degree >= 4) return '#FFBB00'  // Yellow
    if (degree >= 2) return '#88FF88'  // Light green
    return '#88CCFF' // Light blue - low connectivity
  }

  const getEdgeColor = (confidence) => {
    if (confidence >= 0.8) return '#00AA00' // Green - high confidence
    if (confidence >= 0.6) return '#88AA00' // Yellow-green
    if (confidence >= 0.4) return '#AAAA00' // Yellow
    return '#AA8800' // Orange - low confidence
  }

  useEffect(() => {
    if (!containerRef.current || !nodes || !edges) return

    const data = {
      nodes: nodes.map(node => ({
        ...node,
        color: {
          background: getNodeColor(node.value),
          border: '#2B7CE9',
          highlight: {
            background: '#FFA500',
            border: '#FF6600'
          }
        },
        font: {
          size: 16,
          face: 'Arial',
          color: '#333'
        },
        borderWidth: 2,
        shadow: true
      })),
      edges: edges.map(edge => ({
        ...edge,
        color: {
          color: getEdgeColor(edge.value),
          highlight: '#FF6600'
        },
        width: edge.value * 3,
        smooth: {
          type: 'continuous',
          roundness: 0.5
        }
      }))
    }

    const options = {
      nodes: {
        shape: 'dot',
        size: 20,
        font: {
          size: 14,
          face: 'Arial'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        color: { inherit: 'from' },
        smooth: {
          type: 'continuous'
        },
        arrows: {
          to: {
            enabled: false
          }
        }
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.04
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
      }
    }

    const visNetwork = new Network(containerRef.current, data, options)
    setNetwork(visNetwork)

    // Handle node selection
    visNetwork.on('click', (params) => {
      if (params.nodes.length > 0 && onNodeSelect) {
        onNodeSelect(params.nodes[0])
      }
    })

    // Handle node hover
    visNetwork.on('hoverNode', (params) => {
      containerRef.current.style.cursor = 'pointer'
    })

    visNetwork.on('blurNode', () => {
      containerRef.current.style.cursor = 'default'
    })

    return () => {
      if (visNetwork) {
        visNetwork.destroy()
      }
    }
  }, [nodes, edges, onNodeSelect])

  return (
    <div className="network-container">
      <div ref={containerRef} className="network-graph" />
    </div>
  )
}

export default NetworkGraph

