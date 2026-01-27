import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def fix_sumanth_login():
    username = "sumanth"
    try:
        user = User.objects.get(username=username)
        # Disable the forced password reset flag so we can login directly
        user.is_temp_password = False 
        user.save()

        print("\n" + "="*50)
        print(f" LOGIN FIXED FOR USER: {username}")
        print("-" * 50)
        print("Required Password Reset Flag: REMOVED")
        print("You can now login normally with OTP.")
        print("="*50 + "\n")
    except User.DoesNotExist:
        print("User not found.")

if __name__ == '__main__':
    fix_sumanth_login()
