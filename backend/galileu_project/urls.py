from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # rota "principal" usada pelo frontend (/api/auth/...)
    path("api/auth/", include("accounts.urls")),  
    path("admin/", admin.site.urls),
    path("auth/", include("accounts.urls")),
    path("team/", include("teams.urls")),
    
]
