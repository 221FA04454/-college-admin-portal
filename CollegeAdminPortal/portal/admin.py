from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, College, Brochure, Application
from .utils import send_credentials_email
from django.utils.crypto import get_random_string
from .forms import CustomUserCreationForm

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('College Info', {'fields': ('college_id', 'is_temp_password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'college_id'),
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change: # Creating new user
            obj.is_staff = False 
            temp_password = get_random_string(12)
            obj.set_password(temp_password)
            obj.is_temp_password = True
            obj.save()
            
            # Send Email
            try:
                send_credentials_email(obj, temp_password, request)
                self.message_user(request, f"User {obj.username} created and email sent.")
            except Exception as e:
                self.message_user(request, f"User created but email FAILED: {e}", level='error')
        else:
            obj.save()

admin.site.register(User, UserAdmin)
admin.site.register(College)
admin.site.register(Brochure)
admin.site.register(Application)
