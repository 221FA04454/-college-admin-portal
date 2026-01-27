from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewSet, StudentViewSet, ApplicationViewSet, BrochureViewSet, AdContentViewSet

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet)
router.register(r'students', StudentViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'brochures', BrochureViewSet)
router.register(r'ads', AdContentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
