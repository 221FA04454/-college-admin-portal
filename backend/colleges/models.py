from django.db import models

class College(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    # Keeping the single brochure field for backward compatibility/simplicity if needed, 
    # but we will add a separate Brochure model for the 'list of brochures' feature.
    brochure = models.FileField(upload_to='brochures/', blank=True, null=True)
    brochure_mongo_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    view_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Brochure(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='brochures_list/', blank=True, null=True)
    file_mongo_id = models.CharField(max_length=50, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    # Matching CollegeAdminPortal fields + extra
    student_name = models.CharField(max_length=255) # Renamed from name to match or keep name? older used 'name'
    # old backend used 'name', CollegeAdminPortal uses 'student_name'. I'll support 'student_name' via a unified field 'name'
    name = models.CharField(max_length=255) 
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='applications')
    course = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.college.name}"

class Student(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='students')
    course = models.CharField(max_length=100)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class AdContent(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='ads/', blank=True, null=True)
    image_mongo_id = models.CharField(max_length=50, blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
