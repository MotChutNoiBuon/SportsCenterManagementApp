from django.contrib import admin
from sportscenters.models import Trainer, Class, Payment, Enrollment, Progress, Appointment, InternalNews, Notification, User, Member, Receptionist
from django import forms
from django.utils.safestring import mark_safe

'''
list_display: Hiển thị các trường quan trọng.

list_filter: Lọc theo các trường có ý nghĩa.

search_fields: Tìm kiếm theo các trường phổ biến.

ordering: Sắp xếp mặc định.

date_hierarchy: Thêm thanh filter theo ngày.

readonly_fields: Chỉ cho phép xem một số trường.
'''
class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = '__all__'

class BaseUserAdmin(admin.ModelAdmin):
    form = UserForm

    def save_model(self, request, obj, form, change):
        password = form.cleaned_data.get('password')
        if password:
            if not password.startswith('pbkdf2_'):
                obj.set_password(password)
            else:
                obj.password = password  # đã băm sẵn
        super().save_model(request, obj, form, change)


class MyAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ DỤC THỂ THAO'

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'email', 'role', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'role')
    search_fields = ('username', 'email', 'full_name')
    ordering = ['-created_date']
    readonly_fields = ['avatar_preview']
    fieldsets = (
<<<<<<< HEAD
        ('Thông tin tài khoản', {
            'fields': ('username', 'password', 'full_name', 'email', 'role', 'phone', 'avatar', 'avatar_preview')
        }),
        ('Quyền & Trạng thái', {
            'fields': ('is_active',)
        }),
    )

    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"
    avatar_preview.short_description = "Avatar Preview"

class MemberAdmin(BaseUserAdmin):
    list_display = ('full_name', 'payment_status', 'active','avatar_view')
    list_filter = ('payment_status', 'active')
    search_fields = ('full_name', 'payment_status')
    ordering = ['-created_date']
    readonly_fields = ['role','avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username','password' ,'full_name', 'email', 'role', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)}),
    )
    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"

    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"

    avatar_view.short_description = 'Avatar'

    @admin.action(description="Kích hoạt tài khoản đã chọn")
    def activate_members(self, request, queryset):
        queryset.update(is_active=True)


class TrainerAdmin(BaseUserAdmin):
    list_display = ('full_name', 'specialization', 'experience_years', 'active','avatar_view')
    list_filter = ('specialization', 'active')
    search_fields = ('full_name', 'email', 'specialization')
    ordering = ['-created_date']
    readonly_fields = ['role','avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username', 'password', 'full_name', 'email', 'role','specialization', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)}),
=======
        ('Thông tin tài khoản', {'fields': ('username', 'full_name','password', 'email', 'role', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
>>>>>>> 6f85e8df233f81adf38983fb1d404e21cded9f29
    )

    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"
    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"
    avatar_view.short_description = 'Avatar'



class ReceptionistAdmin(BaseUserAdmin):
    list_display = ('full_name', 'work_shift', 'active','avatar')
    list_filter = ('work_shift', 'active')
    search_fields = ('full_name', 'email', 'work_shift')
    ordering = ['-created_date']
    readonly_fields = ['role','avatar_preview']
    fieldsets = (
        ('Thông tin tài khoản',
         {'fields': ('username', 'password', 'full_name', 'email', 'role', 'phone', 'avatar', 'avatar_preview')}),
        ('Trạng thái', {'fields': ('is_active',)}),
    )
    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return mark_safe(f"<img src='{obj.avatar.url}' width='150' style='border-radius: 10px;' />")
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"

    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;'/>")
        return "No Image"

    avatar_view.short_description = 'Avatar'

class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'trainer', 'schedule', 'status', 'price')
    list_filter = ('status', 'trainer')
    search_fields = ('name', 'trainer__full_name')
    ordering = ['-schedule']


class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'gym_class', 'status', 'created_date')
    list_filter = ('status', 'gym_class')
    search_fields = ('member__full_name', 'gym_class__name')
    ordering = ['-created_date']

class ProgressAdmin(admin.ModelAdmin):
    list_display = ('member', 'trainer', 'gym_class')
    search_fields = ('member__full_name', 'trainer__full_name', 'gym_class__name')
    ordering = ['-created_date']



class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'trainer', 'date_time')
    list_filter = ('date_time',)
    search_fields = ('member__full_name', 'trainer__full_name')
    ordering = ['-date_time']

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('member', 'amount', 'payment_method', 'status', 'date_paid')
    list_filter = ('status', 'payment_method')
    search_fields = ('member__full_name', 'transaction_id')
    ordering = ['-date_paid']

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('member', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('member',)
    ordering = ['-created_at']

class InternalNewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_date')
    search_fields = ('title', 'author__full_name')
    ordering = ['-created_date']



admin.site = MyAdminSite(name='myadmin')

admin.site.register(Member, MemberAdmin)
admin.site.register(Trainer, TrainerAdmin)
admin.site.register(Receptionist, ReceptionistAdmin)
admin.site.register(Class, ClassAdmin)
admin.site.register(Enrollment, EnrollmentAdmin)
admin.site.register(Progress, ProgressAdmin)
admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(InternalNews, InternalNewsAdmin)