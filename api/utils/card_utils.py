from sqlalchemy.orm import Session
from models.models import Bank

def validate_card_payment(db: Session, card_number: str, amount: float) -> bool:
    bank_account = db.query(Bank).filter_by(account_number=card_number).first()
    if not bank_account or bank_account.balance < amount:
        return False
    bank_account.balance -= amount
    db.commit()
    return True
