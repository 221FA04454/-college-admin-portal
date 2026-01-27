import os
import django
from django.conf import settings

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from accounts.utils import send_generated_otp

def regenerate_otp_for_sumanth():
    username = "sumanth"
    try:
        user = User.objects.get(username=username)
        # This function generates the OTP, saves it to DB, and prints to console
        print("\nGENERATING NEW OTP...")
        send_generated_otp(user)
        print("OTP GENERATED SUCCESSFULLY\n")
    except User.DoesNotExist:
        print("User not found.")

if __name__ == '__main__':
    regenerate_otp_for_sumanth()
