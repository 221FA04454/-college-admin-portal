from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse

def send_credentials_email(user, temp_password, request):
    login_url = request.build_absolute_uri(reverse('login'))
    
    subject = 'Welcome to CollegeAdminPortal - Your Credentials'
    message = f"""
    Hello,
    
    You have been registered as an Admin.
    
    Here are your login details:
    College ID (Username): {user.username}
    Temporary Password: {temp_password}
    
    Login here: {login_url}
    
    Please log in immediately to reset your password.
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
