import client from './client'

export interface Loan {
  id: number
  lender_name: string
  loan_type: string
  original_amount: number // tiyn
  remaining_balance: number // tiyn
  monthly_payment: number // tiyn
  next_payment_date: string | null
  is_overdue: boolean
  is_active: boolean
  opened_at: string | null
  synced_at: string
}

export interface LoanListResponse {
  loans: Loan[]
  total_balance: number // tiyn
  total_monthly: number // tiyn
  loan_count: number
  dti: number | null
}

export async function getLoans(): Promise<LoanListResponse> {
  const response = await client.get<LoanListResponse>('/loans')
  return response.data
}

export async function getLoan(id: number): Promise<Loan> {
  const response = await client.get<Loan>(`/loans/${id}`)
  return response.data
}

export async function syncLoans(): Promise<LoanListResponse> {
  const response = await client.post<LoanListResponse>('/loans/sync')
  return response.data
}
