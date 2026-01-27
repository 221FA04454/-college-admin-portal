import os
import django
from django.conf import settings

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def reset_sumanth_password():
    username = "sumanth"
    # Specific known password for testing
    temp_password = "TempPassword123!" 
    
    try:
        user = User.objects.get(username=username)
        user.set_password(temp_password)
        user.is_temp_password = True
        user.save()

        print("\n" + "="*50)
        print(f" PASSWORD RESET SUCCESSFUL ")
        print("-" * 50)
        print(f"Username: {username}")
        print(f"New Temporary Password: {temp_password}")
        print("="*50 + "\n")
    except User.DoesNotExist:
        print("User not found. Please create the user first.")

if __name__ == '__main__':
    reset_sumanth_password()
