from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Reel, ReelCategory, ReelTag
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class ReelModelTest(TestCase):
    """Test Reel model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_reel_creation(self):
        """Test creating a reel"""
        video_file = SimpleUploadedFile(
            "test.mp4",
            b"file_content",
            content_type="video/mp4"
        )
        
        reel = Reel.objects.create(
            title_en='Test Reel',
            description_en='Test Description',
            author=self.user,
            video=video_file,
            duration=30
        )
        
        self.assertEqual(reel.title_en, 'Test Reel')
        self.assertEqual(reel.author, self.user)
        self.assertEqual(reel.status, 'draft')
        self.assertFalse(reel.is_approved)
    
    def test_slug_auto_generation(self):
        """Test slug auto-generation"""
        video_file = SimpleUploadedFile(
            "test.mp4",
            b"file_content",
            content_type="video/mp4"
        )
        
        reel = Reel.objects.create(
            title_en='Test Reel',
            author=self.user,
            video=video_file
        )
        
        self.assertEqual(reel.slug, 'test-reel')


class ReelAPITest(APITestCase):
    """Test Reel API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True,
            is_superuser=True
        )
        
        # Create test reel
        video_file = SimpleUploadedFile(
            "test.mp4",
            b"file_content",
            content_type="video/mp4"
        )
        
        self.reel = Reel.objects.create(
            title_en='Test Reel',
            author=self.user,
            video=video_file,
            status='published',
            is_approved=True
        )
    
    def test_list_published_reels(self):
        """Test listing published reels"""
        response = self.client.get('/api/reels/reels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_reel_anonymous(self):
        """Test creating reel as anonymous user"""
        response = self.client.post('/api/reels/reels/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_reel_authenticated(self):
        """Test creating reel as authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        video_file = SimpleUploadedFile(
            "test2.mp4",
            b"file_content",
            content_type="video/mp4"
        )
        
        data = {
            'title_en': 'New Reel',
            'description_en': 'Description',
            'video': video_file,
            'primary_language': 'en'
        }
        
        response = self.client.post('/api/reels/reels/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title_en'], 'New Reel')


class ReelCategoryTest(TestCase):
    """Test ReelCategory model"""
    
    def test_category_creation(self):
        """Test creating a category"""
        category = ReelCategory.objects.create(
            name_en='Entertainment',
            slug='entertainment'
        )
        
        self.assertEqual(category.name_en, 'Entertainment')
        self.assertTrue(category.is_active)


class ReelTagTest(TestCase):
    """Test ReelTag model"""
    
    def test_tag_creation(self):
        """Test creating a tag"""
        tag = ReelTag.objects.create(
            name='Viral',
            slug='viral'
        )
        
        self.assertEqual(tag.name, 'Viral')
        self.assertTrue(tag.is_active)
