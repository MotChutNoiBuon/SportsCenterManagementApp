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


class MyAdminSite(admin.AdminSite):
    site_header = 'HỆ THỐNG QUẢN LÝ TRUNG TÂM THỂ DỤC THỂ THAO'

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = '__all__'

class MemberInline(admin.StackedInline):
    model = Member
    can_delete = False
    extra = 1  # Không hiển thị form trống mặc định

class TrainerInline(admin.StackedInline):
    model = Trainer
    can_delete = False
    extra = 1

class ReceptionistInline(admin.StackedInline):
    model = Receptionist
    can_delete = False
    extra = 1

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'phone', 'is_active', 'avatar_view')
    search_fields = ('username', 'email', 'phone')
    list_filter = ('role', 'is_active')
    readonly_fields = ['avatar_view']
    list_editable = ('role', 'is_active')
    fieldsets = (
        ('Thông tin tài khoản', {'fields': ('username', 'email', 'role', 'phone', 'avatar')}),
        ('Trạng thái', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    actions = ['activate_users']
    save_on_top = True
    form = UserForm

    def avatar_view(self, obj):
        if obj.avatar:
            return mark_safe(f"<img src={obj.avatar.url} width='120' style='border-radius: 10px;' />")
        return "No Image"
    avatar_view.short_description = 'Avatar'

    @admin.action(description="Kích hoạt tài khoản đã chọn")
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)

class MemberAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'payment_status', 'active')
    list_filter = ('payment_status', 'active')
    search_fields = ('full_name', 'payment_status')
    ordering = ['-created_date']


class TrainerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'experience_years', 'active')
    list_filter = ('specialization', 'active')
    search_fields = ('full_name', 'email', 'specialization')
    ordering = ['-created_date']


class ReceptionistAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'work_shift', 'active')
    list_filter = ('work_shift', 'active')
    search_fields = ('full_name', 'email', 'work_shift')
    ordering = ['-created_date']

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

admin.site.register(User, UserAdmin)
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