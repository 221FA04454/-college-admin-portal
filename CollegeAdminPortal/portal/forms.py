from django import forms
from django.contrib.auth.forms import SetPasswordForm, UserCreationForm, ReadOnlyPasswordHashField
from .models import User, Application, Brochure, College

class CustomUserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    # We don't want password field because we generate it.
    
    class Meta:
        model = User
        fields = ('college_id', 'email')

    def save(self, commit=True):
        # We don't save password here; save_model in admin handles it
        user = super().save(commit=False)
        if commit:
            user.save()
        return user

class PasswordResetForcedForm(SetPasswordForm):
    pass

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = '__all__'

class BrochureForm(forms.ModelForm):
    class Meta:
        model = Brochure
        fields = '__all__'

class CollegeForm(forms.ModelForm):
    class Meta:
        model = College
        fields = '__all__'
