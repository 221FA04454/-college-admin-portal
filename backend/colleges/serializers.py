from rest_framework import serializers
from .models import College, Student, Application, Brochure, AdContent

class CollegeSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(source='students.count', read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = College
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'

class BrochureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brochure
        fields = '__all__'

class AdContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdContent
        fields = '__all__'
