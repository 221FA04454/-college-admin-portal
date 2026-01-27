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
