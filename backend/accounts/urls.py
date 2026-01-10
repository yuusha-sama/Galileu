from django.urls import path
from . import views

urlpatterns = [
    path("", views.healthcheck, name="healthcheck"),
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("me/", views.me, name="me"),
    path("logout/", views.logout_view, name="logout"),
]
