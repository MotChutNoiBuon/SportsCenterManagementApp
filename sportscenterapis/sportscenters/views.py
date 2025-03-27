from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.timezone import now
from .models import Class, Trainer, User
from .serializers import ClassSerializer, TrainerSerializer, UserSerializer

class IsTrainerOrAdmin(permissions.BasePermission):
    """Chỉ Admin hoặc Huấn luyện viên của lớp mới có quyền chỉnh sửa."""
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.trainer == request.user  # Huấn luyện viên chỉ chỉnh sửa lớp của họ

class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer

    def get_queryset(self):
        """Hội viên chỉ thấy lớp `active`, Admin/Lễ tân thấy tất cả"""
        if self.request.user.is_staff:
            return Class.objects.all()
        return Class.objects.filter(status='active', deleted_at__isnull=True)

    def get_permissions(self):
        """Phân quyền API"""
        if self.action in ['create', 'update', 'partial_update']:
            return [IsTrainerOrAdmin()]  # Admin & Huấn luyện viên được chỉnh sửa lớp của họ
        elif self.action in ['destroy', 'restore']:
            return [permissions.IsAdminUser()]  # Chỉ Admin mới được xóa/khôi phục lớp
        return [permissions.IsAuthenticated()]  # Hội viên chỉ xem danh sách lớp

    def retrieve(self, request, *args, **kwargs):
        """Chặn truy cập lớp đã bị xóa mềm"""
        instance = self.get_object()
        if instance.deleted_at:
            return Response({"error": "Lớp học này không tồn tại hoặc đã bị xóa."}, status=404)
        return super().retrieve(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Xóa mềm lớp học thay vì xóa cứng"""
        instance = self.get_object()

        if instance.deleted_at:
            return Response({"message": f"Lớp học '{instance.name}' đã bị xóa trước đó."}, status=400)

        instance.deleted_at = now()
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã bị xóa mềm."}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, pk=None):
        """Khôi phục lớp học đã bị xóa mềm"""
        instance = self.get_object()

        if not instance.deleted_at:
            return Response({"message": "Lớp học này chưa bị xóa."}, status=400)

        instance.deleted_at = None
        instance.save()
        return Response({"message": f"Lớp học '{instance.name}' đã được khôi phục."}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        """Hội viên đăng ký vào lớp"""
        obj = self.get_object()
        user = request.user

        if obj.deleted_at:
            return Response({"error": "Lớp học này đã bị xóa."}, status=400)

        if obj.is_full():
            return Response({"error": "Lớp học đã đầy."}, status=400)

        if obj.members.filter(id=user.id).exists():
            return Response({"error": "Bạn đã đăng ký lớp này rồi."}, status=400)

        obj.members.add(user)
        return Response({"message": f"Đăng ký lớp '{obj.name}' thành công."}, status=200)


class TrainerViewSet(viewsets.ModelViewSet):
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]