from typing import List, Dict, Any, Optional
import math


def calculate_monthly_payment(principal: int, term_months: int, annual_rate: float = 0.28) -> int:
    """
    Calculate monthly payment using standard amortization formula.
    principal: loan amount in tiyn
    term_months: loan term
    annual_rate: annual interest rate (default 28%)
    Returns: monthly payment in tiyn
    """
    if term_months <= 0:
        return 0
    monthly_rate = annual_rate / 12
    if monthly_rate == 0:
        return principal // term_months
    payment = principal * monthly_rate * math.pow(1 + monthly_rate, term_months) / (
        math.pow(1 + monthly_rate, term_months) - 1
    )
    return int(payment)


def calculate_utilization(loans: List[Dict[str, Any]]) -> float:
    """Calculate debt utilization ratio from existing loans."""
    total_original = sum(loan.get("original_amount", 0) for loan in loans)
    total_remaining = sum(loan.get("remaining_balance", 0) for loan in loans)
    if total_original == 0:
        return 0.0
    return total_remaining / total_original


def get_utilization_penalty(utilization: float) -> int:
    """Return score penalty based on utilization ratio."""
    if utilization > 0.90:
        return -40
    elif utilization > 0.70:
        return -20
    elif utilization > 0.50:
        return -10
    return 0


def get_loan_types(loans: List[Dict[str, Any]]) -> set:
    """Get set of existing loan types."""
    return {loan.get("loan_type", "") for loan in loans}


def simulate_new_loan(
    current_score: int,
    current_loans: List[Dict[str, Any]],
    loan_type: str,
    amount: int,
    term_months: int,
    monthly_income: int,
) -> Dict[str, Any]:
    """
    Simulate the impact of taking a new loan on credit score.

    Adjustments applied:
    - Hard inquiry penalty: -15
    - New account penalty: -10
    - Utilization: >90% → -40, >70% → -20, >50% → -10, else 0
    - Mix bonus: +5 if new loan type not in existing types
    - Monthly payment: standard amortization at 28% annual rate
    - Verdict: DTI>60% or score<500 → decline; DTI>40% or score<600 → caution; else recommend
    - Recovery: abs(delta) // 3 months
    """
    # Calculate new loan monthly payment
    new_monthly_payment = calculate_monthly_payment(amount, term_months)

    # Current monthly debt payments
    current_monthly_debt = sum(loan.get("monthly_payment", 0) for loan in current_loans)

    # DTI before new loan
    if monthly_income > 0:
        dti_before = current_monthly_debt / monthly_income
        dti_after = (current_monthly_debt + new_monthly_payment) / monthly_income
    else:
        dti_before = 0.0
        dti_after = 0.0

    # Build hypothetical loan list including the new loan
    new_loan = {
        "original_amount": amount,
        "remaining_balance": amount,
        "monthly_payment": new_monthly_payment,
        "loan_type": loan_type,
    }
    all_loans = current_loans + [new_loan]

    # Calculate utilization with new loan
    new_utilization = calculate_utilization(all_loans)
    utilization_penalty = get_utilization_penalty(new_utilization)

    # Hard inquiry penalty
    inquiry_penalty = -15

    # New account penalty
    new_account_penalty = -10

    # Loan mix bonus
    existing_types = get_loan_types(current_loans)
    mix_bonus = 5 if loan_type not in existing_types else 0

    # Total delta
    total_delta = inquiry_penalty + new_account_penalty + utilization_penalty + mix_bonus
    score_after = max(300, current_score + total_delta)

    # Recovery time (months to recover the lost points)
    recovery_months = abs(total_delta) // 3 if total_delta < 0 else 0

    # Determine verdict
    reason = ""
    if dti_after > 0.60 or score_after < 500:
        verdict = "decline"
        if dti_after > 0.60:
            reason = f"Долговая нагрузка ({int(dti_after * 100)}%) превышает допустимый порог в 60%. Высокий риск отказа."
        else:
            reason = f"Кредитный рейтинг ({score_after}) ниже минимального порога в 500 баллов."
    elif dti_after > 0.40 or score_after < 600:
        verdict = "caution"
        if dti_after > 0.40:
            reason = f"Долговая нагрузка ({int(dti_after * 100)}%) повышена. Рассмотрите уменьшение суммы или увеличение срока."
        else:
            reason = f"Кредитный рейтинг ({score_after}) умеренный. Рекомендуем улучшить рейтинг перед подачей заявки."
    else:
        verdict = "recommend"
        reason = f"Долговая нагрузка ({int(dti_after * 100)}%) в норме, рейтинг ({score_after}) достаточный для одобрения."

    return {
        "score_before": current_score,
        "score_after": score_after,
        "score_delta": total_delta,
        "monthly_payment": new_monthly_payment,
        "dti_before": round(dti_before, 4),
        "dti_after": round(dti_after, 4),
        "verdict": verdict,
        "reason": reason,
        "recovery_months": recovery_months,
        "loan_type": loan_type,
        "amount": amount,
        "term_months": term_months,
    }
