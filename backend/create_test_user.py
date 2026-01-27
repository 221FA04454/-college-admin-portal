import os
import django
from django.conf import settings

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from accounts.utils import generate_random_password

def create_sumanth_admin():
    username = "sumanth"
    email = "sumanthofficial2626@gmail.com"
    
    # Check if exists
    if User.objects.filter(username=username).exists():
        print(f"User {username} already exists. resetting password...")
        user = User.objects.get(username=username)
    else:
        user = User(username=username, email=email)

    temp_password = generate_random_password()
    user.set_password(temp_password)
    user.is_temp_password = True
    user.role = 'admin'
    user.save()

    print("\n" + "="*50)
    print(f"MOCK EMAIL TO: {email}")
    print(f"SUBJECT: Welcome Admin - Temporary Credentials")
    print("-" * 50)
    print(f"Username: {username}")
    print(f"Temporary Password: {temp_password}")
    print("="*50 + "\n")

if __name__ == '__main__':
    create_sumanth_admin()
