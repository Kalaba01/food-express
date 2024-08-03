import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

async def send_email(to_email, subject, body):
    from_email = os.getenv('EMAIL_USER')
    from_password = os.getenv('EMAIL_PASSWORD')

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        await aiosmtplib.send(msg, hostname="smtp-mail.outlook.com", port=587,
                              username=from_email, password=from_password,
                              start_tls=True)
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")
