import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def create_superadmin():
    username = "superadmin"
    email = "superadmin@example.com"
    password = "Admin123!"

    try:
        if User.objects.filter(username=username).exists():
            print(f"User {username} already exists. Updating password and permissions...")
            user = User.objects.get(username=username)
            user.set_password(password)
        else:
            print(f"Creating new superuser {username}...")
            user = User(username=username, email=email)
            user.set_password(password)
        
        # Ensure correct permissions for Django Admin
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.role = 'super_admin'
        user.save()

        print("\n" + "="*50)
        print(" SUPERUSER CREATED / UPDATED SUCCESSFULLY ")
        print("-" * 50)
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("="*50 + "\n")

    except Exception as e:
        print(f"Error creating superuser: {e}")

if __name__ == '__main__':
    create_superadmin()
