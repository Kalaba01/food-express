def welcome_email(username):
    return (
        f"Dear {username},\n\n"
        "Welcome to Food Express! We are thrilled to have you join our community of food lovers. Our platform offers you the best dining experiences, whether you want to explore new restaurants or enjoy your favorite meals at home.\n\n"
        "Here are some key features you can enjoy:\n"
        "1. Wide Selection of Restaurants: Browse through a variety of restaurants offering different cuisines.\n"
        "2. Exclusive Offers and Discounts: Stay tuned for special offers and discounts exclusively available to our members.\n"
        "3. Easy and Secure Payments: Pay for your orders securely using our integrated payment gateway.\n"
        "4. Order Tracking: Track your orders in real-time from the restaurant to your doorstep.\n\n"
        "To get started, simply log in to your account and explore the wide range of restaurants and cuisines available. If you have any questions or need assistance, our customer support team is here to help. You can reach us at foodexpressproject@outlook.com or visit our Help Center.\n\n"
        "We hope you enjoy your experience with Food Express. Bon appétit!\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com\n\n"
        "P.S. Don't forget to follow us on social media for the latest updates and promotions!"
    )

def reset_password_email(username, reset_link):
    return (
        f"Dear {username},\n\n"
        "We received a request to reset your password for your Food Express account. If you did not request a password reset, please ignore this email. Otherwise, you can reset your password using the link below:\n\n"
        f"Reset Password Link: {reset_link}\n\n"
        "This link is valid for one hour from the time of receipt. If the link expires, you can request a new one by visiting the 'Forgot Password' section on our website.\n\n"
        "For security reasons, we recommend that you do not share this link with anyone. If you encounter any issues or need further assistance, please contact our support team at foodexpressproject@outlook.com.\n\n"
        "Thank you for choosing Food Express. We value your security and privacy.\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com\n\n"
        "P.S. For more tips on account security, visit our Help Center."
    )

def request_denied_email(first_name, last_name):
    return (
        f"Dear {first_name} {last_name},\n\n"
        "After a thorough review of your request, we regret to inform you that it has been denied.\n"
        "We appreciate your interest in joining us and encourage you to apply again in the future.\n\n"
        "If you have any questions or need further assistance, please do not hesitate to contact us at foodexpressproject@outlook.com.\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com"
    )

def request_reminder_email(first_name, last_name):
    return (
        f"Dear {first_name} {last_name},\n\n"
        "Thank you for your patience. We wanted to let you know that your request is still under review and will be processed as soon as possible.\n\n"
        "We appreciate your understanding and will get back to you with an update shortly.\n\n"
        "If you have any questions in the meantime, please feel free to contact us at foodexpressproject@outlook.com.\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com"
    )

def account_creation_email(first_name, last_name, username, reset_link):
    return (
        f"Hello {first_name} {last_name},\n\n"
        "Your account has been created successfully. Here are your login details:\n\n"
        f"Username: {username}\n\n"
        f"To set your password, please click the following link: {reset_link}\n\n"
        "This link is valid for 24 hours. If the link expires, you can request a new one by visiting the 'Forgot Password' section on our website.\n\n"
        "Thank you for joining Food Express.\n\n"
        "Best regards,\n"
        "The Food Express Team\n"
        "https://www.foodexpress.com"
    )
