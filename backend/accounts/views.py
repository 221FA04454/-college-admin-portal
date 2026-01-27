from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.sessions.models import Session
from .models import User, UserSession
from .forms import LoginForm, OTPForm, CreateAdminForm, PasswordResetForm, CustomPasswordChangeForm
from .utils import send_generated_otp, send_temp_password_email, get_client_ip, generate_random_password

def is_super_admin(user):
    return user.role == 'super_admin'

class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')
        form = LoginForm()
        return render(request, 'accounts/login.html', {'form': form})

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                
                # Check Temp Password
                if user.is_temp_password:
                    return redirect('password_reset_required')
                
                # Check Active Session Logic (Netflix Style)
                try:
                    active_session = UserSession.objects.get(user=user)
                    if active_session.session_key != request.session.session_key:
                        # Session conflict exists
                        return redirect('session_conflict')
                except UserSession.DoesNotExist:
                    pass
                
                # Create/Update Session
                UserSession.objects.update_or_create(
                    user=user,
                    defaults={
                        'session_key': request.session.session_key,
                        'ip_address': get_client_ip(request),
                        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                        'device_name': 'Web Browser' # Can use user-agents lib to parse this
                    }
                )

                # Send OTP and Redirect
                send_generated_otp(user)
                return redirect('verify_otp')
            else:
                messages.error(request, 'Invalid username or password')
        
        return render(request, 'accounts/login.html', {'form': form})

class OTPVerifyView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect('login')
        if request.user.otp_verified:
            return redirect('dashboard')
        return render(request, 'accounts/otp_verify.html')

    def post(self, request):
        otp = request.POST.get('otp')
        user = request.user
        
        if user.verify_otp(otp):
            user.otp_verified = True
            user.save()
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid or expired OTP')
            return render(request, 'accounts/otp_verify.html')

@login_required
def dashboard(request):
    if not request.user.otp_verified and not request.user.is_temp_password:
        return redirect('verify_otp')
    return render(request, 'accounts/dashboard.html', {'user': request.user})

class CreateAdminView(View):
    @method_decorator(user_passes_test(is_super_admin))
    def get(self, request):
        form = CreateAdminForm()
        return render(request, 'accounts/create_admin.html', {'form': form})

    @method_decorator(user_passes_test(is_super_admin))
    def post(self, request):
        form = CreateAdminForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            temp_password = generate_random_password()
            user.set_password(temp_password)
            user.is_temp_password = True
            user.role = 'admin'
            user.save()
            
            send_temp_password_email(user, temp_password)
            messages.success(request, f'Admin {user.username} created successfully. Credentials sent to email.')
            return redirect('dashboard')
        return render(request, 'accounts/create_admin.html', {'form': form})

class PasswordResetRequiredView(View):
    def get(self, request):
        if not request.user.is_temp_password:
            return redirect('dashboard')
        form = CustomPasswordChangeForm(user=request.user)
        return render(request, 'accounts/password_reset_required.html', {'form': form})
        
    def post(self, request):
        form = CustomPasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            user.is_temp_password = False
            user.save()
            update_session_auth_hash(request, user) # Keep user logged in
            messages.success(request, 'Password updated successfully. Please verify OTP.')
            
            # Initiate OTP flow
            send_generated_otp(user)
            return redirect('verify_otp')
        return render(request, 'accounts/password_reset_required.html', {'form': form})

@login_required
def session_conflict_view(request):
    # This view is shown when middleware detects a conflict
    
    # Get details of the OTHER session (the one in DB)
    try:
        active_session = UserSession.objects.get(user=request.user)
        other_device = active_session.device_name
        other_ip = active_session.ip_address
        last_seen = active_session.last_activity
    except UserSession.DoesNotExist:
        # If no session in DB, means we are safe, update DB and go
        return redirect('verify_otp')
        
    return render(request, 'accounts/session_conflict.html', {
        'other_device': other_device,
        'other_ip': other_ip,
        'last_seen': last_seen
    })

@login_required
def force_logout_view(request):
    if request.method == 'POST':
        # 1. Delete the OLD session from Django Session Store
        try:
            old_user_session = UserSession.objects.get(user=request.user)
            # Delete corresponding Django session
            Session.objects.filter(session_key=old_user_session.session_key).delete()
            old_user_session.delete()
        except UserSession.DoesNotExist:
            pass
            
        # 2. Register CURRENT session as the official one
        UserSession.objects.create(
            user=request.user,
            session_key=request.session.session_key,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            device_name='Web Browser'
        )
        
        messages.success(request, 'Previous session terminated. Please continue.')
        send_generated_otp(request.user)
        return redirect('verify_otp')
    
    return redirect('session_conflict')

def logout_view(request):
    try:
        UserSession.objects.filter(user=request.user).delete()
    except:
        pass
    logout(request)
    return redirect('login')
