import client from './client'

export interface ScoreFactor {
  key: string
  value: number
  impact: 'positive' | 'negative' | 'neutral'
  description_ru: string
}

export interface ScoreResponse {
  score: number
  delta: number
  grade: string
  grade_label: string
  fetched_at: string
  factors: ScoreFactor[]
}

export interface ScoreHistoryItem {
  date: string
  score: number
  delta: number
}

export interface ScoreHistoryResponse {
  history: ScoreHistoryItem[]
}

export async function getCurrentScore(): Promise<ScoreResponse> {
  const response = await client.get<ScoreResponse>('/score/current')
  return response.data
}

export async function getScoreHistory(): Promise<ScoreHistoryResponse> {
  const response = await client.get<ScoreHistoryResponse>('/score/history')
  return response.data
}

export async function getScoreFactors(): Promise<ScoreFactor[]> {
  const response = await client.get<ScoreFactor[]>('/score/factors')
  return response.data
}
