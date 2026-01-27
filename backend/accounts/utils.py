from django.core.mail import send_mail
from django.conf import settings
import random
import string

def send_generated_otp(user):
    otp = user.generate_otp()
    subject = 'Your Login OTP for Admin Portal'
    message = f'Hello {user.username},\n\nYour OTP is: {otp}\n\nIt expires in 3 minutes.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    # Print removed for security - Email only
    # print(f"------------\nOTP for {user.username}: {otp}\n------------")
    
    try:
        send_mail(subject, message, from_email, recipient_list)
    except Exception as e:
        print(f"Email failed: {e}")

def send_temp_password_email(user, temp_password):
    subject = 'Welcome Admin - Temporary Credentials'
    login_url = 'http://localhost:8000/login/'
    message = f"""
    Hello {user.username},
    
    Your admin account has been created.
    Username: {user.username}
    Temporary Password: {temp_password}
    
    Login here: {login_url}
    
    You will be required to change this password on first login.
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    # Print removed for security - Email only
    # print(f"------------\nTemp Password for {user.username}: {temp_password}\n------------")
    
    try:
        send_mail(subject, message, from_email, recipient_list)
    except Exception as e:
        print(f"Email failed: {e}")

def generate_random_password():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for i in range(12))

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
