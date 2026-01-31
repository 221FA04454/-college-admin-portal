from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import College, Student, Application, Brochure, AdContent
from .serializers import CollegeSerializer, StudentSerializer, ApplicationSerializer, BrochureSerializer, AdContentSerializer

from rest_framework.parsers import MultiPartParser, FormParser
from .mongodb_utils import upload_file_to_mongo, get_file_from_mongo
from django.http import HttpResponse, Http404
import mimetypes

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

    def perform_create(self, serializer):
        # Check for brochure file
        print("DEBUG: College perform_create triggered")
        brochure_file = self.request.FILES.get('brochure')
        mongo_id = None
        if brochure_file:
            print(f"DEBUG: Uploading brochure {brochure_file.name} to Mongo")
            mongo_id = upload_file_to_mongo(brochure_file, brochure_file.name, brochure_file.content_type)
        
        # Save instance (saving file=None to prevent local storage if we want purely mongo, 
        # or we can save both. The user asked to convert to blob and store in mongo.
        # We will save the mongo_id.)
        # Important: If we don't save to 'brochure' field, the serializer might complain if it was required, 
        # but we made it optional in models.
        serializer.save(brochure_mongo_id=mongo_id)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def download_brochure(self, request, pk=None):
        college = self.get_object()
        if not college.brochure_mongo_id:
            raise Http404("No brochure found")
        
        try:
            grid_out = get_file_from_mongo(college.brochure_mongo_id)
            response = HttpResponse(grid_out.read(), content_type=grid_out.content_type)
            response['Content-Disposition'] = f'attachment; filename="{grid_out.filename}"'
            return response
        except Exception as e:
            raise Http404("File not found in storage")

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

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get('file')
        mongo_id = None
        if uploaded_file:
            mongo_id = upload_file_to_mongo(uploaded_file, uploaded_file.name, uploaded_file.content_type)
        serializer.save(file_mongo_id=mongo_id)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def download(self, request, pk=None):
        brochure = self.get_object()
        if not brochure.file_mongo_id:
            raise Http404("No file found")
        
        try:
            grid_out = get_file_from_mongo(brochure.file_mongo_id)
            response = HttpResponse(grid_out.read(), content_type=grid_out.content_type)
            response['Content-Disposition'] = f'attachment; filename="{grid_out.filename}"'
            return response
        except Exception:
            raise Http404("File not found in storage")

class AdContentViewSet(viewsets.ModelViewSet):
    queryset = AdContent.objects.all()
    serializer_class = AdContentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        image_file = self.request.FILES.get('image')
        mongo_id = None
        if image_file:
            mongo_id = upload_file_to_mongo(image_file, image_file.name, image_file.content_type)
        serializer.save(image_mongo_id=mongo_id)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def render_image(self, request, pk=None):
        ad = self.get_object()
        if not ad.image_mongo_id:
            raise Http404("No image found")
        
        try:
            grid_out = get_file_from_mongo(ad.image_mongo_id)
            return HttpResponse(grid_out.read(), content_type=grid_out.content_type)
        except Exception:
            raise Http404("Image not found in storage")

