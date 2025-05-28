from django.db import models
from django.contrib.auth.models import AbstractUser
import cloudinary.models
from django.utils import timezone

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null =True)
    updated_date = models.DateTimeField(auto_now=True, null =True)


    class Meta:
        abstract = True
        ordering = ['-id']


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('receptionist', 'Receptionist'),
        ('member', 'Member'),
    ]

    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True, null =True)
    updated_date = models.DateTimeField(auto_now=True, null =True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    avatar = cloudinary.models.CloudinaryField('avatar', blank=True, null=True)
    full_name = models.CharField(max_length=255, null=True)


    def __str__(self):
        return f"{self.username} - {self.role}"


# Bảng hội viên
class Member(User):
    payment_status = models.CharField(max_length=10, default='unpaid')
    join_date = models.DateField(null=True, blank=True)
    cancellation_date = models.DateField(null=True, blank=True)
    push_token = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.join_date and self.payment_status == 'paid':
            self.join_date = timezone.now().date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.payment_status}"

    class Meta:
        verbose_name = 'Member'
        verbose_name_plural = 'Members'

# Bảng huấn luyện viên
class Trainer(User):
    SPECIALIZATIONS = [
        ('gym', 'Gym'),
        ('yoga', 'Yoga'),
        ('swimming', 'Swimming'),
        ('dance', 'Dance'),
    ]

    specialization = models.CharField(max_length=20, choices=SPECIALIZATIONS, null=True)
    experience_years = models.IntegerField(null=True)

    def save(self, *args, **kwargs):
        self.role = 'trainer'  # Tự động gán role là 'trainer'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.specialization} ({self.experience_years} years)"

    class Meta:
        verbose_name = 'Trainer'
        verbose_name_plural = 'Trainers'

# Bảng nhân viên lễ tân
class Receptionist(User):
    WORK_SHIFTS = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
    ]

    work_shift = models.CharField(max_length=10, choices=WORK_SHIFTS)


    def __str__(self):
        return f"{self.username} - {self.work_shift}"

    class Meta:
        verbose_name = 'Receptionist'
        verbose_name_plural = 'Receptionists'

# Bảng lớp học
class Class(BaseModel):

    name = models.CharField(max_length=100)
    description = models.TextField()
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField()
    max_members = models.IntegerField()
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('cancelled', 'Cancelled'), ('completed', 'Completed')])
    price = models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Class'
        verbose_name_plural = 'Classes'

# Bảng đăng ký lớp học
from django.db import models

class Enrollment(BaseModel):
    """
    Model lưu trữ thông tin đăng ký lớp học của thành viên.
    Mỗi bản ghi liên kết một thành viên với một lớp học và có trạng thái.
    """
    member = models.ForeignKey(
        'Member',
        on_delete=models.CASCADE,
        verbose_name="Thành viên",
        help_text="Thành viên đăng ký lớp học."
    )
    gym_class = models.ForeignKey(
        'Class',
        on_delete=models.CASCADE,
        verbose_name="Lớp học",
        help_text="Lớp học được đăng ký."
    )
    status = models.CharField(
        max_length=10,
        default='pending',
        verbose_name="Trạng thái",
        help_text="Trạng thái đăng ký (ví dụ: pending, confirmed)."
    )

    def __str__(self):
        return f"{self.member.username} - {self.gym_class.name}"

    class Meta:
        unique_together = ('gym_class', 'member')
        verbose_name = "Đăng ký"
        verbose_name_plural = "Các đăng ký"

# Bảng tiến độ tập luyện
class Progress(BaseModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    gym_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True)
    progress_note = models.TextField()


    def __str__(self):
        return f"{self.member.username} - {self.trainer.username}"

    class Meta:
        verbose_name = 'Progress'
        verbose_name_plural = 'Progresses'

# Bảng lịch tư vấn riêng
class Appointment(BaseModel):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    date_time = models.DateTimeField()

    def __str__(self):
        return f"{self.member.username} - {self.date_time}"

# Bảng thanh toán
class Payment(models.Model):
    PAYMENT_METHODS = [
        ('momo', 'Momo'),
        ('vnpay', 'VNPAY'),
        ('stripe', 'Stripe'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=10, choices=[('success', 'Success'), ('failed', 'Failed'), ('pending', 'Pending')])
    transaction_id = models.CharField(max_length=50, unique=True)
    date_paid = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.username} - {self.status}"

# Bảng thông báo
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('class_schedule', 'Class Schedule'),
        ('promotion', 'Promotion'),
        ('reminder', 'Reminder'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.username} - {self.type}"

# Bảng tin nội bộ
class InternalNews(BaseModel):
    author = models.ForeignKey(Trainer, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()

    def __str__(self):
        return self.title


    class Meta:
        verbose_name = 'Internal News'
        verbose_name_plural = 'Internal News'


class Statistic(models.Model):
    period_type = models.CharField(max_length=20, choices=[('weekly', 'Weekly'), ('monthly', 'Monthly'), ('yearly', 'Yearly')])
    period_start = models.DateField()
    period_end = models.DateField()
    member_count = models.IntegerField(default=0)
    new_members = models.IntegerField(default=0)
    cancelled_members = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE, null=True, blank=True)
    enrollment_count = models.IntegerField(default=0)
    attendance_rate = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)