from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string

class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    is_temp_password = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # OTP Fields
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_verified = models.BooleanField(default=False)

    # Password Policy
    last_password_change = models.DateTimeField(default=timezone.now)
    
    def generate_otp(self):
        code = ''.join(random.choices(string.digits, k=6))
        self.otp_code = code
        self.otp_created_at = timezone.now()
        self.otp_verified = False
        self.save()
        return code

    def verify_otp(self, code):
        if not self.otp_code or not self.otp_created_at:
            return False
            
        # Check expiration (3 minutes)
        time_diff = timezone.now() - self.otp_created_at
        if time_diff.total_seconds() > 180:
            return False
            
        if self.otp_code == code:
            self.otp_verified = True
            self.otp_code = None # Consume OTP
            self.save()
            return True
        return False

class UserSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='active_session')
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    device_name = models.CharField(max_length=100, default='Unknown Device')

    def __str__(self):
        return f"{self.user.username} - {self.device_name}"

class SystemSettings(models.Model):
    # Singleton Model to store global config
    maintenance_mode = models.BooleanField(default=False)
    global_announcement = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        self.pk = 1 # Force singleton
        super(SystemSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "System Settings"

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    action = models.CharField(max_length=255, db_index=True)
    details = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'action']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp}"
