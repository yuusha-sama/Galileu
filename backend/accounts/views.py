import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model

User = get_user_model()

def _json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return {}

@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    data = _json(request)
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or not password:
        return JsonResponse({"error": "username, email e password são obrigatórios."}, status=400)

    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"error": "Nome de usuário já existe."}, status=400)

    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"error": "Email já cadastrado."}, status=400)

    # ✅ SENHA VAI COM HASH NO BD
    user = User.objects.create_user(username=username, email=email, password=password)

    return JsonResponse({"ok": True, "id": user.id, "username": user.username, "email": user.email}, status=201)

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    data = _json(request)
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return JsonResponse({"error": "email e password são obrigatórios."}, status=400)

    user = authenticate(request, email=email, password=password)
    if user is None:
        return JsonResponse({"error": "Credenciais inválidas."}, status=401)

    login(request, user)  # ✅ cria cookie de sessão
    return JsonResponse({"ok": True, "username": user.username, "email": user.email})

@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})

@require_http_methods(["GET"])
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)

    u = request.user
    return JsonResponse({"authenticated": True, "id": u.id, "username": u.username, "email": u.email})
