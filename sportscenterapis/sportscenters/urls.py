from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('classes', views.ClassViewSet, basename='class')
router.register('trainers', views.TrainerViewSet, basename='trainer')
router.register('users', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls))
]