from rest_framework import viewsets, permissions
from .models import Class, Trainer, User
from .serializers import ClassSerializer, TrainerSerializer, UserSerializer

class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    def get_permissions(self):
        """Phân quyền API"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]  # Chỉ Admin/Lễ tân mới có quyền
        return [permissions.IsAuthenticated()]  # Hội viên có thể xem danh sách lớp

class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
