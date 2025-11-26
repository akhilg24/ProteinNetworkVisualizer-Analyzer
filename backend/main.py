from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import networkx as nx
import numpy as np
from collections import defaultdict
import uvicorn

app = FastAPI(title="BioGraph Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample protein interaction data generator
def generate_sample_protein_network():
    """
    Generate realistic sample protein interaction data
    Based on common protein families and interaction patterns
    """
    proteins = [
        "TP53", "BRCA1", "BRCA2", "EGFR", "KRAS", "PIK3CA", "PTEN", "AKT1",
        "MYC", "RB1", "CDKN2A", "MDM2", "VHL", "APC", "NF1", "MET", "ERBB2",
        "FGFR2", "IDH1", "IDH2", "BRAF", "NRAS", "HRAS", "PIK3R1", "STK11",
        "CTNNB1", "SMAD4", "CDH1", "ARID1A", "KMT2D", "KMT2C", "SETD2", "ARID2"
    ]
    
    # Define protein families and their interactions
    families = {
        "DNA_Repair": ["TP53", "BRCA1", "BRCA2", "MDM2"],
        "Growth_Signaling": ["EGFR", "ERBB2", "KRAS", "NRAS", "HRAS", "BRAF"],
        "PI3K_Pathway": ["PIK3CA", "PIK3R1", "PTEN", "AKT1"],
        "Cell_Cycle": ["RB1", "CDKN2A", "MYC", "TP53"],
        "Tumor_Suppressor": ["TP53", "PTEN", "RB1", "VHL", "APC", "NF1"],
        "Metabolism": ["IDH1", "IDH2", "STK11"],
        "Wnt_Pathway": ["CTNNB1", "APC", "SMAD4"],
        "Chromatin": ["ARID1A", "KMT2D", "KMT2C", "SETD2", "ARID2"]
    }
    
    interactions = []
    interaction_id = 1
    
    # Create interactions within families (stronger connections)
    for family, members in families.items():
        for i, protein1 in enumerate(members):
            for protein2 in members[i+1:]:
                if protein1 in proteins and protein2 in proteins:
                    score = np.random.uniform(0.7, 0.95)  # High confidence within family
                    interactions.append({
                        "id": interaction_id,
                        "protein1": protein1,
                        "protein2": protein2,
                        "confidence": round(score, 3),
                        "type": "direct",
                        "family": family
                    })
                    interaction_id += 1
    
    # Create cross-family interactions (weaker but important)
    cross_interactions = [
        ("TP53", "MDM2", 0.85),
        ("TP53", "BRCA1", 0.75),
        ("EGFR", "KRAS", 0.70),
        ("KRAS", "PIK3CA", 0.65),
        ("PTEN", "AKT1", 0.80),
        ("MYC", "TP53", 0.60),
        ("RB1", "CDKN2A", 0.75),
        ("VHL", "TP53", 0.55),
        ("BRAF", "KRAS", 0.50),
        ("ERBB2", "EGFR", 0.70),
        ("MET", "EGFR", 0.65),
        ("IDH1", "TP53", 0.45),
        ("CTNNB1", "APC", 0.80),
        ("SMAD4", "APC", 0.70),
        ("ARID1A", "TP53", 0.50)
    ]
    
    for protein1, protein2, base_score in cross_interactions:
        if protein1 in proteins and protein2 in proteins:
            score = base_score + np.random.uniform(-0.1, 0.1)
            score = max(0.3, min(0.95, score))
            interactions.append({
                "id": interaction_id,
                "protein1": protein1,
                "protein2": protein2,
                "confidence": round(score, 3),
                "type": "indirect",
                "family": "cross_family"
            })
            interaction_id += 1
    
    # Add some random interactions
    for _ in range(20):
        p1, p2 = np.random.choice(proteins, 2, replace=False)
        if not any((i["protein1"] == p1 and i["protein2"] == p2) or 
                  (i["protein1"] == p2 and i["protein2"] == p1) 
                  for i in interactions):
            score = np.random.uniform(0.3, 0.6)
            interactions.append({
                "id": interaction_id,
                "protein1": p1,
                "protein2": p2,
                "confidence": round(score, 3),
                "type": "predicted",
                "family": "unknown"
            })
            interaction_id += 1
    
    return {
        "proteins": proteins,
        "interactions": interactions,
        "families": families
    }

# Initialize sample data
sample_data = generate_sample_protein_network()

class NetworkResponse(BaseModel):
    nodes: List[Dict]
    edges: List[Dict]
    stats: Dict

class AnalysisRequest(BaseModel):
    metric: str  # "degree", "betweenness", "closeness", "clustering"

@app.get("/")
async def root():
    return {"message": "Protein Interaction Network Analyzer API"}

@app.get("/network", response_model=NetworkResponse)
async def get_network():
    """Get the complete protein interaction network"""
    G = nx.Graph()
    
    # Add nodes
    for protein in sample_data["proteins"]:
        G.add_node(protein)
    
    # Add edges
    for interaction in sample_data["interactions"]:
        G.add_edge(
            interaction["protein1"],
            interaction["protein2"],
            weight=interaction["confidence"],
            type=interaction["type"],
            family=interaction["family"]
        )
    
    # Prepare nodes for visualization
    nodes = []
    for protein in sample_data["proteins"]:
        degree = G.degree(protein)
        nodes.append({
            "id": protein,
            "label": protein,
            "value": degree,
            "title": f"Protein: {protein}<br>Degree: {degree}"
        })
    
    # Prepare edges for visualization
    edges = []
    for interaction in sample_data["interactions"]:
        edges.append({
            "from": interaction["protein1"],
            "to": interaction["protein2"],
            "value": interaction["confidence"],
            "title": f"Confidence: {interaction['confidence']}<br>Type: {interaction['type']}"
        })
    
    # Calculate network statistics
    stats = {
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "density": round(nx.density(G), 4),
        "average_degree": round(sum(dict(G.degree()).values()) / G.number_of_nodes(), 2),
        "is_connected": nx.is_connected(G),
        "number_of_components": nx.number_connected_components(G)
    }
    
    return NetworkResponse(nodes=nodes, edges=edges, stats=stats)

@app.get("/analysis/{metric}")
async def get_analysis(metric: str):
    """Get network analysis metrics"""
    G = nx.Graph()
    
    # Build graph
    for interaction in sample_data["interactions"]:
        G.add_edge(
            interaction["protein1"],
            interaction["protein2"],
            weight=interaction["confidence"]
        )
    
    if metric == "degree":
        centrality = dict(G.degree())
        metric_name = "Degree Centrality"
        description = "Number of direct connections"
    elif metric == "betweenness":
        centrality = nx.betweenness_centrality(G)
        metric_name = "Betweenness Centrality"
        description = "Importance as a bridge between other nodes"
    elif metric == "closeness":
        centrality = nx.closeness_centrality(G)
        metric_name = "Closeness Centrality"
        description = "Average distance to all other nodes"
    elif metric == "clustering":
        centrality = nx.clustering(G)
        metric_name = "Clustering Coefficient"
        description = "Tendency to form clusters"
    else:
        raise HTTPException(status_code=400, detail="Invalid metric")
    
    # Sort by value
    sorted_centrality = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "metric": metric_name,
        "description": description,
        "values": [{"protein": protein, "value": round(score, 4)} for protein, score in sorted_centrality]
    }

@app.get("/clustering")
async def get_clustering():
    """AI-powered community detection using Louvain algorithm"""
    G = nx.Graph()
    
    # Build graph with weights
    for interaction in sample_data["interactions"]:
        G.add_edge(
            interaction["protein1"],
            interaction["protein2"],
            weight=interaction["confidence"]
        )
    
    # Use greedy modularity communities (Louvain-like)
    communities = nx.community.greedy_modularity_communities(G)
    
    # Convert to list format
    community_list = []
    for i, community in enumerate(communities):
        community_list.append({
            "id": i,
            "proteins": list(community),
            "size": len(community)
        })
    
    # Calculate modularity
    modularity = nx.community.modularity(G, communities)
    
    return {
        "communities": community_list,
        "modularity": round(modularity, 4),
        "number_of_communities": len(community_list)
    }

@app.get("/predictions")
async def get_predictions():
    """Predict missing protein interactions using graph structure"""
    G = nx.Graph()
    
    # Build graph
    for interaction in sample_data["interactions"]:
        G.add_edge(
            interaction["protein1"],
            interaction["protein2"],
            weight=interaction["confidence"]
        )
    
    # Get all possible pairs
    all_proteins = list(G.nodes())
    existing_edges = set(G.edges())
    
    # Predict based on common neighbors (Jaccard similarity)
    predictions = []
    for i, protein1 in enumerate(all_proteins):
        for protein2 in all_proteins[i+1:]:
            if (protein1, protein2) not in existing_edges and (protein2, protein1) not in existing_edges:
                neighbors1 = set(G.neighbors(protein1))
                neighbors2 = set(G.neighbors(protein2))
                
                if len(neighbors1) > 0 and len(neighbors2) > 0:
                    common_neighbors = neighbors1.intersection(neighbors2)
                    union_neighbors = neighbors1.union(neighbors2)
                    
                    if len(union_neighbors) > 0:
                        jaccard = len(common_neighbors) / len(union_neighbors)
                        
                        # Also consider degree product (more connected = more likely)
                        degree_factor = (G.degree(protein1) * G.degree(protein2)) / (len(all_proteins) ** 2)
                        
                        # Combined score
                        prediction_score = (jaccard * 0.7) + (degree_factor * 0.3)
                        
                        if prediction_score > 0.2:  # Threshold for predictions
                            predictions.append({
                                "protein1": protein1,
                                "protein2": protein2,
                                "score": round(prediction_score, 3),
                                "common_neighbors": len(common_neighbors),
                                "reason": f"Shared {len(common_neighbors)} common neighbors"
                            })
    
    # Sort by score
    predictions.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "predictions": predictions[:20],  # Top 20 predictions
        "total_predictions": len(predictions)
    }

@app.get("/protein/{protein_name}")
async def get_protein_details(protein_name: str):
    """Get detailed information about a specific protein"""
    if protein_name not in sample_data["proteins"]:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    G = nx.Graph()
    for interaction in sample_data["interactions"]:
        G.add_edge(
            interaction["protein1"],
            interaction["protein2"],
            weight=interaction["confidence"]
        )
    
    # Get neighbors
    neighbors = list(G.neighbors(protein_name))
    
    # Get interactions involving this protein
    protein_interactions = [
        i for i in sample_data["interactions"]
        if i["protein1"] == protein_name or i["protein2"] == protein_name
    ]
    
    # Calculate metrics
    degree = G.degree(protein_name)
    clustering = nx.clustering(G, protein_name)
    
    # Find which family it belongs to
    family = "Unknown"
    for fam, members in sample_data["families"].items():
        if protein_name in members:
            family = fam
            break
    
    return {
        "protein": protein_name,
        "family": family,
        "degree": degree,
        "clustering_coefficient": round(clustering, 4),
        "neighbors": neighbors,
        "interactions": protein_interactions
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

