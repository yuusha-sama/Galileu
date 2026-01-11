from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # funciona direto no Django:
    path("auth/", include("accounts.urls")),

    # funciona quando o front chama /api/auth/...:
    path("api/auth/", include("accounts.urls")),
]
