export interface ScoreGrade {
  label: string
  color: string
  ringColor: string
}

export function getScoreGrade(score: number, t?: (key: string) => string): ScoreGrade {
  const tr = t || ((k: string) => {
    const defaults: Record<string, string> = {
      'grade.excellent': 'Отличный',
      'grade.good': 'Хороший',
      'grade.satisfactory': 'Удовлетворительный',
      'grade.poor': 'Плохой',
      'grade.critical': 'Критический',
    }
    return defaults[k] || k
  })

  if (score >= 750) {
    return { label: tr('grade.excellent'), color: '#AAFF00', ringColor: '#AAFF00' }
  } else if (score >= 650) {
    return { label: tr('grade.good'), color: '#AAFF00', ringColor: '#AAFF00' }
  } else if (score >= 550) {
    return { label: tr('grade.satisfactory'), color: '#FFB800', ringColor: '#FFB800' }
  } else if (score >= 450) {
    return { label: tr('grade.poor'), color: '#FF6B35', ringColor: '#FF6B35' }
  } else {
    return { label: tr('grade.critical'), color: '#FF3B3B', ringColor: '#FF3B3B' }
  }
}

export function getScoreColor(score: number): string {
  if (score >= 750) return 'text-[#AAFF00]'
  if (score >= 650) return 'text-[#AAFF00]'
  if (score >= 550) return 'text-[#FFB800]'
  if (score >= 450) return 'text-[#FF6B35]'
  return 'text-[#FF3B3B]'
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'positive':
      return '#AAFF00'
    case 'negative':
      return '#FF3B3B'
    default:
      return '#FFB800'
  }
}

export function getFactorLabel(key: string, t?: (k: string) => string): string {
  if (t) {
    const result = t(`factor.${key}`)
    if (result !== `factor.${key}`) return result
  }
  const labels: Record<string, string> = {
    utilization: 'Долговая нагрузка',
    payment_history: 'История платежей',
    loan_count: 'Количество кредитов',
    inquiries: 'Запросы в кредитное бюро',
    credit_age: 'Возраст кредитной истории',
    mix: 'Разнообразие кредитов',
  }
  return labels[key] || key
}
