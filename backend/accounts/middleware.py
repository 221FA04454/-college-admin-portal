from django.conf import settings
from django.shortcuts import redirect
from django.contrib.sessions.models import Session
from .models import UserSession
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Check if current session key matches the stored active session for user
            try:
                user_session = UserSession.objects.get(user=request.user)
                
                # If the session key in DB is different from current request's session key
                if user_session.session_key != request.session.session_key:
                    # Logic for "Netflix Style" Conflict
                    # We store a flag in the session to show the conflict modal
                    # But we only redirect if we are NOT already on the login/logout/conflict page
                    
                    allowed_paths = [
                        reverse('logout'), 
                        reverse('login'), 
                        reverse('session_conflict'), 
                        reverse('force_logout')
                    ]
                    
                    if request.path not in allowed_paths:
                        return redirect('session_conflict')
                        
            except UserSession.DoesNotExist:
                pass
                
        response = self.get_response(request)
        return response

class MaintenanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from .models import SystemSettings
        from django.urls import reverse
        from django.shortcuts import render
        from rest_framework_simplejwt.authentication import JWTAuthentication
        
        # Check if Maintenance Mode is ON
        try:
            settings_obj = SystemSettings.load()
            if settings_obj.maintenance_mode:
                path = request.path
                
                # 1. ALWAYS Allow these paths
                if (
                    path.startswith('/admin/') or 
                    path.startswith('/static/') or 
                    path.startswith('/media/') or
                    path == reverse('login') or
                    path.startswith('/api/login/') or
                    path.startswith('/api/verify-otp/') or
                    path.startswith('/api/maintenance-mode/') # CRITICAL: Allow toggling it off
                ):
                    return self.get_response(request)

                # 2. Check Standard Django Session Auth (Browser Admin)
                if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
                    return self.get_response(request)

                # 3. Check JWT Auth (React Admin)
                if path.startswith('/api/'):
                    try:
                        jwt_auth = JWTAuthentication()
                        auth_result = jwt_auth.authenticate(request)
                        if auth_result is not None:
                            user, token = auth_result
                            if user.is_staff or user.role in ['super_admin', 'admin']:
                                request.user = user # Attach user for the view
                                return self.get_response(request)
                    except Exception as e:
                        pass # Token invalid or missing

                # Block everything else
                return render(request, 'maintenance.html', status=503)
        except Exception:
            pass

        response = self.get_response(request)
        return response
