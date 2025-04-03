from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Chỉ Admin mới có quyền truy cập."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

class IsTrainer(permissions.BasePermission):
    """Chỉ Huấn luyện viên mới có quyền truy cập."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Trainer").exists()

class IsReceptionist(permissions.BasePermission):
    """Chỉ Nhân viên lễ tân mới có quyền truy cập."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Receptionist").exists()

class IsMember(permissions.BasePermission):
    """Chỉ Hội viên mới có quyền truy cập."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Member").exists()

class IsOwnerOrAdmin(permissions.BasePermission):
    """Chỉ Admin hoặc chính chủ sở hữu tài khoản mới có quyền chỉnh sửa."""
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user

class AllowAnyPermission(permissions.AllowAny):
    """Cho phép tất cả mọi người truy cập API."""
    pass

class IsTrainerOrAdmin(permissions.BasePermission):
    """Chỉ Admin hoặc Huấn luyện viên mới có quyền chỉnh sửa lớp học."""
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.trainer == request.user

class CanManageClass(permissions.BasePermission):
    """Huấn luyện viên hoặc lễ tân có thể quản lý lớp học."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.groups.filter(name="Trainer").exists() or request.user.groups.filter(name="Receptionist").exists()
        )

class CanEnrollInClass(permissions.BasePermission):
    """Hội viên có thể đăng ký vào lớp học."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name="Member").exists()

class CanManagePayments(permissions.BasePermission):
    """Admin hoặc lễ tân có quyền kiểm tra/thanh toán."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.groups.filter(name="Receptionist").exists())

class CanPostInternalNews(permissions.BasePermission):
    """Chỉ Admin hoặc Huấn luyện viên có thể đăng bài trên bảng tin nội bộ."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.groups.filter(name="Trainer").exists())
