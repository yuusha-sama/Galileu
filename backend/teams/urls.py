from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.team_me),
    path("members/", views.members),
    path("members/<int:pk>/", views.member_delete),
    path("robots/", views.robots),
    path("robots/<int:pk>/", views.robot_delete),
]
