from django.shortcuts import redirect
from django.urls import reverse

class ForcePasswordResetMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.user.is_temp_password:
            # If user has temp password, they MUST be on the reset page or logout
            allowed_paths = [reverse('password_reset_forced'), reverse('logout')]
            if request.path not in allowed_paths:
                return redirect('password_reset_forced')
        
        response = self.get_response(request)
        return response
