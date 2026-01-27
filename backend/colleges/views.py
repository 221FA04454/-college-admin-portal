from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import College, Student, Application, Brochure, AdContent
from .serializers import CollegeSerializer, StudentSerializer, ApplicationSerializer, BrochureSerializer, AdContentSerializer

from rest_framework.parsers import MultiPartParser, FormParser

class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        college = self.get_object()
        college.view_count += 1
        college.save()
        return Response({'status': 'viewed', 'total_views': college.view_count})

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

class BrochureViewSet(viewsets.ModelViewSet):
    queryset = Brochure.objects.all()
    serializer_class = BrochureSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

class AdContentViewSet(viewsets.ModelViewSet):
    queryset = AdContent.objects.all()
    serializer_class = AdContentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

