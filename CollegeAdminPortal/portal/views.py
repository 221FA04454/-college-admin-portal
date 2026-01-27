from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import update_session_auth_hash
from django.contrib import messages
from .models import College, Brochure, Application
from .forms import PasswordResetForcedForm, BrochureForm, ApplicationForm, CollegeForm

@login_required
def dashboard(request):
    return render(request, 'portal/dashboard.html')

@login_required
def password_reset_forced(request):
    if not request.user.is_temp_password:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = PasswordResetForcedForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            user.is_temp_password = False
            user.save()
            messages.success(request, 'Password updated. Please login again.')
            return redirect('login') # Prompt says "After success -> redirect to login again"
    else:
        form = PasswordResetForcedForm(request.user)
        
    return render(request, 'portal/password_reset_forced.html', {'form': form})

# --- Modules ---

@login_required
def applications_list(request):
    apps = Application.objects.all()
    # If using CRUD
    return render(request, 'portal/applications_list.html', {'applications': apps})

@login_required
def application_create(request):
    if request.method == 'POST':
        form = ApplicationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('applications_list')
    else:
        form = ApplicationForm()
    return render(request, 'portal/form.html', {'form': form, 'title': 'Add Application'})

@login_required
def brochures_list(request):
    brochures = Brochure.objects.all()
    if request.method == 'POST':
        form = BrochureForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('brochures_list')
    else:
        form = BrochureForm()
    return render(request, 'portal/brochures_list.html', {'brochures': brochures, 'form': form})

@login_required
def brochure_delete(request, pk):
    b = get_object_or_404(Brochure, pk=pk)
    b.delete()
    return redirect('brochures_list')

@login_required
def colleges_list(request):
    colleges = College.objects.all()
    return render(request, 'portal/colleges_list.html', {'colleges': colleges})

@login_required
def college_create(request):
    if request.method == 'POST':
        form = CollegeForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('colleges_list')
    else:
        form = CollegeForm()
    return render(request, 'portal/form.html', {'form': form, 'title': 'Add College'})

@login_required
def college_delete(request, pk):
    c = get_object_or_404(College, pk=pk)
    c.delete()
    return redirect('colleges_list')
