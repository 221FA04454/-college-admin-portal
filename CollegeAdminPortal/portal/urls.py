from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('login/', auth_views.LoginView.as_view(template_name='portal/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('reset-password-forced/', views.password_reset_forced, name='password_reset_forced'),
    
    path('applications/', views.applications_list, name='applications_list'),
    path('applications/add/', views.application_create, name='application_create'),
    
    path('brochures/', views.brochures_list, name='brochures_list'),
    path('brochures/delete/<int:pk>/', views.brochure_delete, name='brochure_delete'),
    
    path('colleges/', views.colleges_list, name='colleges_list'),
    path('colleges/add/', views.college_create, name='college_create'),
    path('colleges/delete/<int:pk>/', views.college_delete, name='college_delete'),
]
