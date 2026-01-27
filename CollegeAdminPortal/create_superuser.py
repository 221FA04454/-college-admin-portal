from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()
if not User.objects.filter(username='superadmin').exists():
    User.objects.create_superuser('superadmin', 'admin@example.com', 'Admin123!')
    print("Superuser 'superadmin' created with password 'Admin123!'")
else:
    print("Superuser 'superadmin' already exists.")
