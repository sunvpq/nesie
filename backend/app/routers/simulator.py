from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.loan import Loan
from app.models.simulation import Simulation
from app.schemas.simulator import SimulatorRequest, SimulatorResult
from app.services.score_calculator import simulate_new_loan
from app.services.pkb_mock import get_score_from_iin, get_loans_from_iin

router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.post("/calculate", response_model=SimulatorResult)
async def calculate_simulation(
    payload: SimulatorRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Calculate the impact of a hypothetical new loan on credit score."""
    # Get current score
    if current_user.iin:
        current_score = get_score_from_iin(current_user.iin)
    else:
        current_score = 650  # Default score for users without IIN

    # Get current loans
    result = await db.execute(
        select(Loan).where(Loan.user_id == current_user.id, Loan.is_active == True)
    )
    db_loans = result.scalars().all()

    if db_loans:
        current_loans = [
            {
                "original_amount": loan.original_amount,
                "remaining_balance": loan.remaining_balance,
                "monthly_payment": loan.monthly_payment,
                "loan_type": loan.loan_type,
            }
            for loan in db_loans
        ]
    elif current_user.iin:
        # Use mock loans if DB is empty
        raw_loans = get_loans_from_iin(current_user.iin)
        current_loans = [
            {
                "original_amount": l["original_amount"],
                "remaining_balance": l["remaining_balance"],
                "monthly_payment": l["monthly_payment"],
                "loan_type": l["type"],
            }
            for l in raw_loans
        ]
    else:
        current_loans = []

    # Run simulation
    result_data = simulate_new_loan(
        current_score=current_score,
        current_loans=current_loans,
        loan_type=payload.loan_type,
        amount=payload.amount,
        term_months=payload.term_months,
        monthly_income=payload.monthly_income,
    )

    # Save simulation to DB
    sim = Simulation(
        user_id=current_user.id,
        loan_type=result_data["loan_type"],
        amount=result_data["amount"],
        term_months=result_data["term_months"],
        monthly_income=payload.monthly_income,
        score_before=result_data["score_before"],
        score_after=result_data["score_after"],
        score_delta=result_data["score_delta"],
        monthly_payment=result_data["monthly_payment"],
        dti_before=result_data["dti_before"],
        dti_after=result_data["dti_after"],
        verdict=result_data["verdict"],
        reason=result_data["reason"],
        recovery_months=result_data["recovery_months"],
    )
    db.add(sim)
    await db.commit()

    return SimulatorResult(**result_data)
