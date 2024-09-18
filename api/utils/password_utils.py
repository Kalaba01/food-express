from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashes the provided password using bcrypt
async def hash_password(password: str):
    return pwd_context.hash(password)

# Verifies if the provided plain password matches the hashed password
async def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# Generates a temporary password based on the current UTC datetime
async def generate_temp_password():
    now = datetime.utcnow()
    temp_password = ''.join([chr(int(digit) + 97) for digit in now.strftime("%Y%m%d%H%M%S")])
    return temp_password

# Returns the hashed version of the provided password using bcrypt
def get_password_hash(password):
    return pwd_context.hash(password)
