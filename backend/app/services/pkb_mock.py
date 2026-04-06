import hashlib
from datetime import date, timedelta
from typing import List, Dict, Any


MOCK_LENDERS = [
    {
        "name": "Kaspi Bank",
        "type": "consumer",
        "original_amount": 500000_00,
        "remaining_balance": 320000_00,
        "monthly_payment": 28000_00,
    },
    {
        "name": "Halyk Bank",
        "type": "auto",
        "original_amount": 3000000_00,
        "remaining_balance": 2100000_00,
        "monthly_payment": 85000_00,
    },
    {
        "name": "Home Credit",
        "type": "consumer",
        "original_amount": 200000_00,
        "remaining_balance": 80000_00,
        "monthly_payment": 15000_00,
    },
    {
        "name": "Forte Bank",
        "type": "mortgage",
        "original_amount": 15000000_00,
        "remaining_balance": 12000000_00,
        "monthly_payment": 95000_00,
    },
    {
        "name": "МФО Solva",
        "type": "micro",
        "original_amount": 100000_00,
        "remaining_balance": 45000_00,
        "monthly_payment": 12000_00,
    },
    {
        "name": "МФО KMF",
        "type": "micro",
        "original_amount": 150000_00,
        "remaining_balance": 90000_00,
        "monthly_payment": 18000_00,
    },
    {
        "name": "Отбасы банк",
        "type": "mortgage",
        "original_amount": 12000000_00,
        "remaining_balance": 9500000_00,
        "monthly_payment": 78000_00,
    },
    {
        "name": "Евразийский банк",
        "type": "consumer",
        "original_amount": 350000_00,
        "remaining_balance": 180000_00,
        "monthly_payment": 22000_00,
    },
]

MOCK_FACTORS = [
    {
        "key": "utilization",
        "value": 0.42,
        "impact": "negative",
        "description_ru": "Долговая нагрузка составляет 42% от кредитного лимита",
    },
    {
        "key": "payment_history",
        "value": 0.96,
        "impact": "positive",
        "description_ru": "96% платежей были произведены вовремя",
    },
    {
        "key": "loan_count",
        "value": 3,
        "impact": "neutral",
        "description_ru": "3 активных кредита — умеренная нагрузка",
    },
    {
        "key": "inquiries",
        "value": 2,
        "impact": "negative",
        "description_ru": "2 жёстких запроса за последние 6 месяцев",
    },
]


def _seed_from_iin(iin: str) -> int:
    """Create a deterministic integer seed from an IIN."""
    digest = hashlib.md5(iin.encode()).hexdigest()
    return int(digest[:8], 16)


def get_score_from_iin(iin: str) -> int:
    """Return a deterministic credit score (450-820) based on IIN."""
    return int(hashlib.md5(iin.encode()).hexdigest()[:4], 16) % 371 + 450


def get_loans_from_iin(iin: str) -> List[Dict[str, Any]]:
    """Return 2-4 deterministic mock loans based on IIN."""
    seed = _seed_from_iin(iin)
    # Pick how many loans: 2, 3, or 4
    num_loans = (seed % 3) + 2
    # Pick which lenders (deterministic shuffle)
    indices = list(range(len(MOCK_LENDERS)))
    # Simple seeded shuffle using the seed value
    for i in range(len(indices) - 1, 0, -1):
        j = (seed >> i) % (i + 1)
        indices[i], indices[j] = indices[j], indices[i]
    selected_indices = indices[:num_loans]

    today = date.today()
    loans = []
    for idx, lender_idx in enumerate(selected_indices):
        lender = MOCK_LENDERS[lender_idx].copy()
        # Vary the balances slightly based on seed
        variation = ((seed >> (idx * 4)) % 20 - 10) / 100  # ±10%
        lender["remaining_balance"] = int(lender["remaining_balance"] * (1 + variation))
        lender["monthly_payment"] = int(lender["monthly_payment"] * (1 + variation * 0.5))
        # Set next payment date: somewhere in the next 30 days
        days_until = ((seed >> (idx * 8)) % 28) + 1
        lender["next_payment_date"] = today + timedelta(days=days_until)
        lender["opened_at"] = today - timedelta(days=((seed >> (idx * 6)) % 730) + 90)
        lender["is_overdue"] = False
        lender["is_active"] = True
        loans.append(lender)

    return loans


def get_factors_from_iin(iin: str) -> List[Dict[str, Any]]:
    """Return mock score factors with slight variation based on IIN."""
    seed = _seed_from_iin(iin)
    factors = []
    for i, factor in enumerate(MOCK_FACTORS):
        f = factor.copy()
        if f["key"] == "utilization":
            # Vary utilization 0.30-0.65
            f["value"] = round(0.30 + ((seed >> (i * 5)) % 35) / 100, 2)
            f["description_ru"] = f"Долговая нагрузка составляет {int(f['value'] * 100)}% от кредитного лимита"
            f["impact"] = "negative" if f["value"] > 0.50 else "neutral"
        elif f["key"] == "payment_history":
            # Vary 0.85-1.0
            f["value"] = round(0.85 + ((seed >> (i * 4)) % 15) / 100, 2)
            f["description_ru"] = f"{int(f['value'] * 100)}% платежей были произведены вовремя"
            f["impact"] = "positive" if f["value"] >= 0.95 else "neutral"
        elif f["key"] == "loan_count":
            loans = get_loans_from_iin(iin)
            f["value"] = len(loans)
            f["description_ru"] = f"{len(loans)} активных кредита — умеренная нагрузка"
        elif f["key"] == "inquiries":
            f["value"] = (seed >> 10) % 5  # 0-4 inquiries
            f["description_ru"] = f"{int(f['value'])} жёстких запроса за последние 6 месяцев"
            f["impact"] = "negative" if f["value"] >= 3 else "neutral"
        factors.append(f)
    return factors


def get_score_delta_from_iin(iin: str) -> int:
    """Return a mock monthly delta for the score."""
    seed = _seed_from_iin(iin)
    # Delta between -25 and +30
    return ((seed >> 16) % 56) - 25
