from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # NGINX está tirando o /api/ e mandando /auth/ pro Django
    path("auth/", include("accounts.urls")),
]
