from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.loan import Loan
from app.schemas.loan import LoanResponse, LoanListResponse
from app.services.pkb_mock import get_loans_from_iin

router = APIRouter(prefix="/loans", tags=["loans"])


@router.get("", response_model=LoanListResponse)
async def get_loans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all active loans for the authenticated user."""
    result = await db.execute(
        select(Loan).where(Loan.user_id == current_user.id, Loan.is_active == True)
    )
    loans = result.scalars().all()

    if not loans and current_user.iin:
        # Sync from PKB mock if no loans in DB
        await _sync_loans_from_pkb(current_user, db)
        result = await db.execute(
            select(Loan).where(Loan.user_id == current_user.id, Loan.is_active == True)
        )
        loans = result.scalars().all()

    loan_responses = [LoanResponse.model_validate(loan) for loan in loans]
    total_balance = sum(l.remaining_balance for l in loans)
    total_monthly = sum(l.monthly_payment for l in loans)

    return LoanListResponse(
        loans=loan_responses,
        total_balance=total_balance,
        total_monthly=total_monthly,
        loan_count=len(loans),
        dti=None,
    )


@router.get("/{loan_id}", response_model=LoanResponse)
async def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific loan by ID."""
    result = await db.execute(
        select(Loan).where(Loan.id == loan_id, Loan.user_id == current_user.id)
    )
    loan = result.scalar_one_or_none()
    if not loan:
        raise HTTPException(status_code=404, detail="Кредит не найден")
    return LoanResponse.model_validate(loan)


@router.post("/sync", response_model=LoanListResponse)
async def sync_loans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sync loans from PKB (mock)."""
    if not current_user.iin:
        raise HTTPException(
            status_code=400,
            detail="Необходимо указать ИИН для получения данных о кредитах",
        )

    await _sync_loans_from_pkb(current_user, db)

    result = await db.execute(
        select(Loan).where(Loan.user_id == current_user.id, Loan.is_active == True)
    )
    loans = result.scalars().all()
    loan_responses = [LoanResponse.model_validate(loan) for loan in loans]
    total_balance = sum(l.remaining_balance for l in loans)
    total_monthly = sum(l.monthly_payment for l in loans)

    return LoanListResponse(
        loans=loan_responses,
        total_balance=total_balance,
        total_monthly=total_monthly,
        loan_count=len(loans),
    )


async def _sync_loans_from_pkb(user: User, db: AsyncSession):
    """Sync loans from PKB mock service into the database."""
    # Deactivate existing loans
    result = await db.execute(
        select(Loan).where(Loan.user_id == user.id, Loan.is_active == True)
    )
    existing_loans = result.scalars().all()
    for loan in existing_loans:
        loan.is_active = False

    # Get mock loans from PKB
    mock_loans = get_loans_from_iin(user.iin)

    for ml in mock_loans:
        loan = Loan(
            user_id=user.id,
            lender_name=ml["name"],
            loan_type=ml["type"],
            original_amount=ml["original_amount"],
            remaining_balance=ml["remaining_balance"],
            monthly_payment=ml["monthly_payment"],
            next_payment_date=ml.get("next_payment_date"),
            is_overdue=ml.get("is_overdue", False),
            is_active=True,
            opened_at=ml.get("opened_at"),
        )
        db.add(loan)

    await db.commit()
