from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # rota "principal" usada pelo frontend (/api/auth/...)
    path("api/auth/", include("accounts.urls")),

    # compatibilidade (se o NGINX estiver removendo o prefixo /api/)
    path("auth/", include("accounts.urls")),
]
