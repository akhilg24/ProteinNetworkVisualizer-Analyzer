# 🧬 Protein Network Visualizer and Analyzer

A simple yet powerful web-based visualizer for protein-protein interaction networks. This tool helps researchers and students explore biological networks through interactive graph visualization, AI-powered community detection, and network analysis algorithms. Built with React for the frontend and FastAPI with NetworkX for graph processing, it provides an intuitive way to understand complex protein relationships and predict potential interactions.

<!-- Add screenshot.png to the root directory to display the dashboard image -->
[BioGraph Explorer Dashboard](./screenshot.png) 

## What It Is

BioGraph Explorer is a basic but effective network visualizer that transforms complex protein interaction data into interactive, explorable graphs. It's designed for anyone who wants to understand how proteins interact with each other - from students learning about biological networks to researchers analyzing pathway relationships.

## Tools Used & How

**Frontend (React + Vite)**
- **React**: Builds the interactive user interface
- **Vite**: Fast development server and build tool
- **vis-network**: Renders the interactive graph visualization (nodes and edges)
- **Axios**: Handles API calls to the backend

**Backend (FastAPI + Python)**
- **FastAPI**: Creates REST API endpoints for network data
- **NetworkX**: Python library for graph analysis and algorithms
- **NumPy**: Handles numerical computations for network metrics

**How It Works:**
1. Backend generates sample protein interaction data (or you can load your own)
2. NetworkX processes the data to calculate network metrics
3. AI algorithms (Louvain, centrality measures) analyze the graph structure
4. Frontend receives the data and visualizes it using vis-network
5. Users can interact with the graph, click nodes, and explore analysis results

## Features

- **📊 Interactive Network Visualization**: Click, drag, and zoom through protein networks
- **🤖 AI-Powered Clustering**: Automatically groups related proteins into communities
- **📈 Centrality Analysis**: Identifies the most important proteins in the network
- **🔮 Interaction Prediction**: Suggests potential missing protein interactions
- **🔍 Protein Details**: View detailed information about any protein
- **📦 Sample Data**: Pre-loaded with 33 proteins and 100+ interactions ready to explore

## Quick Start

### Backend Setup

```bash
cd ProteinNetworkAnalyzer/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd ProteinNetworkAnalyzer/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Sample Data

The application includes a pre-loaded sample network featuring:
- **33 proteins** from major cancer-related pathways
- **100+ interactions** with confidence scores
- **8 protein families**: DNA Repair, Growth Signaling, PI3K Pathway, Cell Cycle, Tumor Suppressor, Metabolism, Wnt Pathway, Chromatin
- Realistic interaction patterns based on biological pathways

## Features in Detail

### Network Visualization
- Interactive graph with zoom, pan, and drag
- Color-coded nodes by connectivity (degree)
- Edge thickness based on interaction confidence
- Hover tooltips with protein information
- Click to select and view protein details

### Centrality Analysis
- **Degree Centrality**: Number of direct connections
- **Betweenness Centrality**: Importance as a bridge
- **Closeness Centrality**: Average distance to other nodes
- **Clustering Coefficient**: Tendency to form clusters

### AI-Powered Clustering
- Community detection using greedy modularity
- Identifies protein communities/families
- Calculates network modularity score
- Visual grouping of related proteins

### Interaction Prediction
- Predicts missing interactions using:
  - Common neighbor analysis (Jaccard similarity)
  - Degree-based scoring
  - Graph structure patterns
- Provides top 20 predicted interactions with confidence scores

## API Endpoints

- `GET /network` - Get complete network data
- `GET /analysis/{metric}` - Get centrality analysis
- `GET /clustering` - Get community detection results
- `GET /predictions` - Get predicted interactions
- `GET /protein/{name}` - Get protein details

## Project Structure

```
ProteinNetworkAnalyzer/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # API utilities
│   │   └── App.jsx          # Main app
│   └── package.json
└── README.md
```

## License
MIT

