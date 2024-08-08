from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def hash_password(password: str):
    return pwd_context.hash(password)

async def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

async def generate_temp_password():
    now = datetime.utcnow()
    temp_password = ''.join([chr(int(digit) + 97) for digit in now.strftime("%Y%m%d%H%M%S")])
    return temp_password
