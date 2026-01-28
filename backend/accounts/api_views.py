from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, UserSession, SystemSettings, AuditLog
from .utils import send_generated_otp, get_client_ip, send_temp_password_email, generate_random_password
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import serializers

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'details', 'ip_address', 'timestamp']
        depth = 1 # To show user details if needed

class APIMaintenanceModeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings = SystemSettings.load()
        return Response({'maintenance_mode': settings.maintenance_mode, 'updated_at': settings.updated_at})

    def post(self, request):
        if request.user.role != 'super_admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        settings = SystemSettings.load()
        mode = request.data.get('maintenance_mode')
        
        if mode is not None:
             settings.maintenance_mode = bool(mode)
             settings.updated_by = request.user
             settings.save()
             
             # Log Action
             AuditLog.objects.create(
                 user=request.user,
                 action="MAINTENANCE_TOGGLE",
                 details=f"Maintenance Mode set to {settings.maintenance_mode}",
                 ip_address=get_client_ip(request)
             )
             
             return Response({'status': 'SUCCESS', 'maintenance_mode': settings.maintenance_mode})
        
        return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

class APIAnnouncementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings = SystemSettings.load()
        return Response({'global_announcement': settings.global_announcement, 'updated_at': settings.updated_at})
        
    def post(self, request):
        if request.user.role != 'super_admin':
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
             
        settings = SystemSettings.load()
        announcement = request.data.get('announcement')
        
        settings.global_announcement = announcement
        settings.updated_by = request.user
        settings.save()
        
        # Log Action
        AuditLog.objects.create(
             user=request.user,
             action="ANNOUNCEMENT_UPDATE",
             details=f"Updated Global Announcement",
             ip_address=get_client_ip(request)
        )
        
        return Response({'status': 'SUCCESS', 'message': 'Announcement updated'})

class APIAuditLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'super_admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        logs = AuditLog.objects.all().order_by('-timestamp')[:50]
        # Manual serialization to avoid DRF Serializer complexity overhead if not needed
        data = []
        for log in logs:
            data.append({
                'id': log.id,
                'user': log.user.username,
                'action': log.action,
                'details': log.details,
                'ip': log.ip_address,
                'timestamp': log.timestamp
            })
        return Response(data)

class APIChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'error': 'Both old and new passwords are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(old_password):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        # Maintain session after password change
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, user)
        
        # Log this action
        try:
            from .models import AuditLog
            from .utils import get_client_ip
            AuditLog.objects.create(
                user=user,
                action="PASSWORD_CHANGE",
                details="User changed their password",
                ip_address=get_client_ip(request)
            )
        except Exception:
            pass

        return Response({'status': 'SUCCESS', 'message': 'Password changed successfully'})

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class APICreateAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'super_admin':
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        username = request.data.get('username')
        email = request.data.get('email')
        
        if not username or not email:
            return Response({'error': 'Username and email are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(username=username).exists():
             return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(username=username, email=email, role='admin')
        temp_password = generate_random_password()
        user.set_password(temp_password)
        user.is_temp_password = True
        user.save()
        
        send_temp_password_email(user, temp_password)
        
        return Response({'status': 'SUCCESS', 'message': f'Admin {username} created. Credentials sent to email.'})

class APILoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            # 1. Check Temp Password
            if user.is_temp_password:
                return Response({'status': 'TEMP_PASSWORD_RESET_REQUIRED', 'username': user.username}, status=status.HTTP_200_OK)
            
            # 2. Check Session Conflict (Netflix Style)
            try:
                active_session = UserSession.objects.get(user=user)
                return Response({
                    'status': 'SESSION_CONFLICT', 
                    'message': 'You are logged in on another device.',
                    'device': active_session.device_name,
                    'ip': active_session.ip_address,
                    'last_login': active_session.last_activity
                }, status=status.HTTP_200_OK)
            except UserSession.DoesNotExist:
                pass

            # 3. Generate OTP
            send_generated_otp(user)
            return Response({'status': 'OTP_REQUIRED', 'message': 'OTP sent to email'}, status=status.HTTP_200_OK)
            
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class APILogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            UserSession.objects.filter(user=request.user).delete()
        except:
            pass
        return Response({'status': 'SUCCESS', 'message': 'Logged out successfully'})

class APIVerifyOTPView(APIView):
    permission_classes = [AllowAny] # We don't have a token yet

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.verify_otp(otp):
            # Success! Login the user and return Tokens
            
            # Record Session
            UserSession.objects.update_or_create(
                user=user,
                defaults={
                    'session_key': 'jwt_session', # In JWT we don't track session keys strictly like cookies, but we track the user record
                    'ip_address': get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'device_name': 'Web Browser (API)'
                }
            )
            
            tokens = get_tokens_for_user(user)
            return Response({
                'status': 'SUCCESS',
                'tokens': tokens,
                'role': user.role,
                'username': user.username
            })
        
        return Response({'error': 'Invalid or Expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

from colleges.models import College, Student, Application
from django.db import models

class APIDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_students = Student.objects.count()
        active_colleges = College.objects.count()
        applications_pending = Application.objects.filter(status='pending').count()
        total_applications = Application.objects.count()
        
        # Calculate Total Views
        total_views = College.objects.aggregate(sum_views=models.Sum('view_count'))['sum_views'] or 0
        
        active_sessions = UserSession.objects.count()

        stats = {
            'total_students': total_students,
            'active_colleges': active_colleges,
            'applications_pending': applications_pending,
            'total_applications': total_applications,
            'total_views': total_views,
            'active_sessions': active_sessions,
            'revenue': '₹12.4L', # Placeholder
            'system_health': 'Good'
        }
        return Response(stats)

class APIForceLogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            UserSession.objects.filter(user=user).delete()
            return Response({'status': 'LOGOUT_SUCCESS', 'message': 'Other sessions terminated.'})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class APISendHelpEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        
        if not subject or not message:
            return Response({'error': 'Subject and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real app, this would send an email to the Super Admin
        # For now, we will print it or simulate it using the existing utility
        
        # Notify Super Admin
        admin_email = settings.DEFAULT_FROM_EMAIL # Or a specific super admin email
        
        full_message = f"Help Desk Request from {request.user.username} ({request.user.email}):\n\n{message}"
        
        try:
            send_mail(
                subject=f"Help Desk: {subject}",
                message=full_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=False,
            )
            return Response({'status': 'SUCCESS', 'message': 'Your message has been sent to the Super Admin.'})
        except Exception as e:
            print(f"Help Desk Email Failed: {e}")
            return Response({'error': 'Failed to send email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
