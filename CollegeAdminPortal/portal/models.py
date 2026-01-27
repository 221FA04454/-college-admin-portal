from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.crypto import get_random_string

class User(AbstractUser):
    # Role management: Superuser is is_superuser=True
    # Admin (College) is is_staff=True (to access portal, maybe not django admin) or just custom role
    # We will use 'is_college_admin' flag or just rely on 'is_superuser' false
    
    college_id = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Used as username for college admins")
    is_temp_password = models.BooleanField(default=False)
    
    # We use username as the main identifier, which will be the College ID for admins
    
    def __str__(self):
        return self.username

class College(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Brochure(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='brochures/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    student_name = models.CharField(max_length=255)
    email = models.EmailField()
    course = models.CharField(max_length=100)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student_name} - {self.course}"
