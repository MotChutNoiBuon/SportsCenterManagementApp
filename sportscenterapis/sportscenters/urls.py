from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('members', views.MemberViewSet, basename='member')
router.register('trainers', views.TrainerViewSet, basename='trainer')
router.register('receptionists', views.ReceptionistViewSet, basename='receptionist')
router.register('classes', views.ClassViewSet, basename='class')
router.register('enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register('progress', views.ProgressViewSet, basename='progress')
router.register('appointments', views.AppointmentViewSet, basename='appointment')
router.register('payments', views.PaymentViewSet, basename='payment')
router.register('notifications', views.NotificationViewSet, basename='notification')
router.register('internalnews', views.InternalNewsViewSet, basename='internalnews')

urlpatterns = [
    path('', include(router.urls))

]