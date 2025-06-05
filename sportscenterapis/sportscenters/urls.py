from django.urls import path, include
from . import views
from rest_framework import routers

from .views import TrainerClassListView, TrainerStudentListView

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
router.register(r'stats', views.StatisticViewSet, basename='stats')
urlpatterns = [
    path('', include(router.urls)),
    path('users/current-user/', views.UserViewSet.get_current_user, name='current_user'),
    path('trainer/enrollments/', TrainerClassListView.as_view(), name='trainer-enrollments'),
    path('trainer/students/', TrainerStudentListView.as_view(), name='trainer-student-list'),

]