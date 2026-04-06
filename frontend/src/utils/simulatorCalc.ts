export type LoanType = 'consumer' | 'auto' | 'mortgage' | 'micro'

export interface SimInputs {
  amount: number        // tenge
  termMonths: number
  loanType: LoanType
  monthlyIncome: number // tenge
}

export interface UserData {
  currentScore: number
  currentMonthlyPayments: number // tenge (sum of existing loan payments)
}

export interface ScoreBreakdownItem {
  key: string
  delta: number
  label: string // filled by caller with t()
}

export interface ApprovalInfo {
  tier: 'top' | 'mid' | 'low' | 'rejected'
  banks: string[]
  chance: number
}

export interface SimCalcResult {
  annualRate: number
  monthlyPayment: number   // tenge
  totalPaid: number        // tenge
  overpayment: number      // tenge
  scoreDelta: number
  projectedScore: number
  currentScore: number
  newDTI: number
  oldDTI: number
  recoveryMonths: number
  approvalInfo: ApprovalInfo
  verdict: 'recommend' | 'caution' | 'decline'
  breakdown: ScoreBreakdownItem[]
}

function getInterestRate(type: LoanType, score: number): number {
  const rates: Record<LoanType, number> = {
    consumer: score > 700 ? 0.24 : score > 600 ? 0.32 : score > 500 ? 0.42 : 0.65,
    auto:     score > 700 ? 0.18 : score > 600 ? 0.24 : score > 500 ? 0.32 : 0.48,
    mortgage: score > 700 ? 0.14 : score > 600 ? 0.18 : score > 500 ? 0.24 : 0.36,
    micro:    score > 700 ? 0.48 : score > 600 ? 0.72 : score > 500 ? 0.98 : 0.98,
  }
  return rates[type]
}

function getApprovalChance(score: number): ApprovalInfo {
  if (score >= 700) return { tier: 'top', banks: ['Halyk', 'Kaspi', 'Forte'], chance: 90 }
  if (score >= 600) return { tier: 'mid', banks: ['Home Credit', 'Евразийский'], chance: 65 }
  if (score >= 500) return { tier: 'low', banks: ['МФО Solva', 'МФО KMF'], chance: 40 }
  return { tier: 'rejected', banks: [], chance: 5 }
}

export function simulateCredit(inputs: SimInputs, userData: UserData): SimCalcResult {
  const { amount, termMonths, loanType, monthlyIncome } = inputs
  const { currentScore, currentMonthlyPayments } = userData

  // Interest rate
  const annualRate = getInterestRate(loanType, currentScore)
  const monthlyRate = annualRate / 12

  // Monthly payment (standard amortization)
  const monthlyPayment = monthlyRate === 0
    ? Math.round(amount / termMonths)
    : Math.round(
        amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      )

  // Total and overpayment
  const totalPaid = monthlyPayment * termMonths
  const overpayment = totalPaid - amount

  // DTI
  const income = monthlyIncome || 200000
  const oldDTI = currentMonthlyPayments / income
  const newTotalMonthly = currentMonthlyPayments + monthlyPayment
  const newDTI = newTotalMonthly / income

  // Score impact breakdown
  const breakdown: ScoreBreakdownItem[] = []

  // 1. Hard inquiry
  breakdown.push({ key: 'inquiry', delta: -15, label: '' })

  // 2. New account
  breakdown.push({ key: 'new_account', delta: -10, label: '' })

  // 3. DTI impact
  let dtiDelta = 0
  if (newDTI > 0.7) dtiDelta = -50
  else if (newDTI > 0.6) dtiDelta = -35
  else if (newDTI > 0.5) dtiDelta = -20
  else if (newDTI > 0.4) dtiDelta = -10
  else if (newDTI > 0.3) dtiDelta = -5
  if (dtiDelta !== 0) {
    breakdown.push({ key: 'dti', delta: dtiDelta, label: '' })
  }

  // 4. Amount size
  let amountDelta = 0
  if (amount > 5000000) amountDelta = -15
  else if (amount > 2000000) amountDelta = -8
  else if (amount > 500000) amountDelta = -3
  if (amountDelta !== 0) {
    breakdown.push({ key: 'amount', delta: amountDelta, label: '' })
  }

  // 5. Loan type risk
  let typeDelta = 0
  if (loanType === 'micro') typeDelta = -20
  else if (loanType === 'consumer') typeDelta = -5
  else if (loanType === 'mortgage') typeDelta = 5
  if (typeDelta !== 0) {
    breakdown.push({ key: 'type', delta: typeDelta, label: '' })
  }

  const scoreDelta = breakdown.reduce((s, b) => s + b.delta, 0)
  const projectedScore = Math.max(300, Math.min(850, currentScore + scoreDelta))

  // Recovery
  const recoveryMonths = scoreDelta < 0 ? Math.ceil(Math.abs(scoreDelta) / 3) : 0

  // Verdict
  const verdict: 'recommend' | 'caution' | 'decline' =
    newDTI > 0.6 || projectedScore < 500
      ? 'decline'
      : newDTI > 0.45 || projectedScore < 600
        ? 'caution'
        : 'recommend'

  return {
    annualRate,
    monthlyPayment,
    totalPaid,
    overpayment,
    scoreDelta,
    projectedScore,
    currentScore,
    newDTI,
    oldDTI,
    recoveryMonths,
    approvalInfo: getApprovalChance(projectedScore),
    verdict,
    breakdown,
  }
}
