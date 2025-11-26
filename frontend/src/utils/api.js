import axios from 'axios'

const API_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getNetwork = async () => {
  const response = await api.get('/network')
  return response.data
}

export const getAnalysis = async (metric) => {
  const response = await api.get(`/analysis/${metric}`)
  return response.data
}

export const getClustering = async () => {
  const response = await api.get('/clustering')
  return response.data
}

export const getPredictions = async () => {
  const response = await api.get('/predictions')
  return response.data
}

export const getProteinDetails = async (proteinName) => {
  const response = await api.get(`/protein/${proteinName}`)
  return response.data
}

