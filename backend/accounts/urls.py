from django.urls import path
from .views import health, register, login_view, me, logout_view

urlpatterns = [
    path("", health, name="auth-health"),
    path("register/", register, name="register"),
    path("login/", login_view, name="login"),
    path("me/", me, name="me"),
    path("logout/", logout_view, name="logout"),
]
