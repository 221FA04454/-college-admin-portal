from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls), # Standard Django Admin
    path('', include('accounts.urls')), # Our Custom Portal
    path('', include('colleges.urls')), # Colleges & Students
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
