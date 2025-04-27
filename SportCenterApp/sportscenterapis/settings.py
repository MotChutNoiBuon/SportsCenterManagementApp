# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']  # Cho phép tất cả host trong môi trường development

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://10.0.2.2:8000",
    "http://127.0.0.1:8000",
    "http://192.168.1.100:8000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True  # Chỉ sử dụng trong development

# Thêm CORS vào INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'sportscenters.apps.SportscentersConfig',
    'ckeditor',
    'drf_yasg',
    'ckeditor_uploader',
    'oauth2_provider',
    'rest_framework',
    'django_extensions',
    'rest_framework.authtoken',
    'corsheaders',  # Thêm CORS headers
]

# Thêm CORS middleware vào MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Thêm CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
] 