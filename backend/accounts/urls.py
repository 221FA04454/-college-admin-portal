from django.urls import path
from .views import (
    LoginView, 
    OTPVerifyView, 
    dashboard, 
    CreateAdminView, 
    PasswordResetRequiredView,
    session_conflict_view,
    force_logout_view,
    logout_view
)
from .api_views import (
    APILoginView,
    APIVerifyOTPView,
    APIDashboardStatsView,
    APIForceLogoutView,
    APILogoutView,
    APICreateAdminView
)

urlpatterns = [
    # Template Views (Legacy)
    path('', LoginView.as_view(), name='login'),
    path('login/', LoginView.as_view(), name='login_url'),
    path('otp-verify/', OTPVerifyView.as_view(), name='verify_otp'),
    path('dashboard/', dashboard, name='dashboard'),
    path('create-admin/', CreateAdminView.as_view(), name='create_admin'),
    path('reset-password-required/', PasswordResetRequiredView.as_view(), name='password_reset_required'),
    path('session-conflict/', session_conflict_view, name='session_conflict'),
    path('force-logout/', force_logout_view, name='force_logout'),
    path('logout/', logout_view, name='logout'),

    # JSON API Endpoints (For React Admin)
    path('api/login/', APILoginView.as_view(), name='api_login'),
    path('api/verify-otp/', APIVerifyOTPView.as_view(), name='api_verify_otp'),
    path('api/dashboard/', APIDashboardStatsView.as_view(), name='api_dashboard'),
    path('api/force-logout/', APIForceLogoutView.as_view(), name='api_force_logout'),
    path('api/logout/', APILogoutView.as_view(), name='api_logout'),
    path('api/create-admin/', APICreateAdminView.as_view(), name='api_create_admin'),
]
