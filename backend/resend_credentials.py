import os
import django
from django.conf import settings
from django.core.mail import send_mail

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from accounts.utils import generate_random_password

def resend_credentials():
    username = "sumanth"
    email = "sumanthofficial2626@gmail.com"
    
    try:
        user = User.objects.get(username=username)
        print(f"User {username} found. Resetting password...")
    except User.DoesNotExist:
        print(f"User {username} not found. Creating...")
        user = User(username=username, email=email)
        user.role = 'admin'

    temp_password = generate_random_password()
    user.set_password(temp_password)
    user.is_temp_password = True
    user.save()

    print(f"Generated new temp password.")
    
    # Send Email
    subject = 'Resent: Welcome Admin - Temporary Credentials'
    login_url = 'http://localhost:5174/login' # Pointing to React Admin
    message = f"""
    Hello {user.username},
    
    Here are your requested temporary credentials.
    
    Username: {user.username}
    Temporary Password: {temp_password}
    
    Login here: {login_url}
    
    You will be required to change this password on first login.
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    
    print(f"Attempting to send email to {user.email}...")
    try:
        send_mail(subject, message, from_email, recipient_list)
        print("SUCCESS: Email sent successfully.")
    except Exception as e:
        print(f"ERROR: Email sending failed. Reason: {e}")
        # Print credentials to console as backup if email fails so user isn't stuck
        print("\n*** BACKUP CREDENTIALS (Use these if email didn't arrive) ***")
        print(f"Username: {username}")
        print(f"Password: {temp_password}")
        print("*************************************************************\n")

if __name__ == '__main__':
    resend_credentials()
