import { create } from 'zustand'
import type { ScoreResponse, ScoreFactor } from '../api/score'
import type { LoanListResponse } from '../api/loans'

interface ScoreState {
  scoreData: ScoreResponse | null
  loanData: LoanListResponse | null
  isLoadingScore: boolean
  isLoadingLoans: boolean
  scoreError: string | null
  loansError: string | null

  setScoreData: (data: ScoreResponse) => void
  setLoanData: (data: LoanListResponse) => void
  setLoadingScore: (loading: boolean) => void
  setLoadingLoans: (loading: boolean) => void
  setScoreError: (error: string | null) => void
  setLoansError: (error: string | null) => void
  clearAll: () => void
}

export const useScoreStore = create<ScoreState>((set) => ({
  scoreData: null,
  loanData: null,
  isLoadingScore: false,
  isLoadingLoans: false,
  scoreError: null,
  loansError: null,

  setScoreData: (data) => set({ scoreData: data, scoreError: null }),
  setLoanData: (data) => set({ loanData: data, loansError: null }),
  setLoadingScore: (loading) => set({ isLoadingScore: loading }),
  setLoadingLoans: (loading) => set({ isLoadingLoans: loading }),
  setScoreError: (error) => set({ scoreError: error }),
  setLoansError: (error) => set({ loansError: error }),
  clearAll: () =>
    set({
      scoreData: null,
      loanData: null,
      isLoadingScore: false,
      isLoadingLoans: false,
      scoreError: null,
      loansError: null,
    }),
}))
