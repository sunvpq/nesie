import client from './client'

export interface SimulatorRequest {
  loan_type: 'consumer' | 'auto' | 'mortgage' | 'micro'
  amount: number // tiyn
  term_months: number
  monthly_income: number // tiyn
}

export interface SimulatorResult {
  score_before: number
  score_after: number
  score_delta: number
  monthly_payment: number // tiyn
  dti_before: number
  dti_after: number
  verdict: 'recommend' | 'caution' | 'decline'
  reason: string
  recovery_months: number | null
  loan_type: string
  amount: number // tiyn
  term_months: number
}

export async function calculateSimulation(data: SimulatorRequest): Promise<SimulatorResult> {
  const response = await client.post<SimulatorResult>('/simulator/calculate', data)
  return response.data
}
