import json
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout


def healthcheck(request):
    return JsonResponse({"status": "ok"})


def _json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return None


def _only_digits(s):
    return re.sub(r"\D+", "", s or "")


def _cpf_is_valid(cpf: str) -> bool:
    cpf = _only_digits(cpf)

    if len(cpf) != 11:
        return False

    # bloqueia CPFs com todos os dígitos iguais
    if cpf == cpf[0] * 11:
        return False

    def calc_digit(base: str, weights):
        s = sum(int(d) * w for d, w in zip(base, weights))
        d = (s * 10) % 11
        return 0 if d == 10 else d

    d1 = calc_digit(cpf[:9], list(range(10, 1, -1)))
    d2 = calc_digit(cpf[:10], list(range(11, 1, -1)))

    return cpf[-2:] == f"{d1}{d2}"


@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = _json(request)
    if data is None:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()

    # campos opcionais vindos do formulário (não salva no User padrão, mas valida se vier)
    cpf = (data.get("cpf") or "").strip()

    if not email or not password:
        return JsonResponse({"detail": "Email e senha são obrigatórios"}, status=400)

    if len(password) < 8:
        return JsonResponse({"detail": "Senha deve ter pelo menos 8 caracteres"}, status=400)

    if cpf and not _cpf_is_valid(cpf):
        return JsonResponse({"detail": "CPF inválido"}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({"detail": "Email já cadastrado"}, status=409)

    user = User.objects.create_user(
        username=email,  # username = email
        email=email,
        password=password,
        first_name=name[:150],
    )

    return JsonResponse({"ok": True, "id": user.id, "email": user.email})


@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = _json(request)
    if data is None:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({"detail": "Credenciais inválidas"}, status=401)

    login(request, user)
    return JsonResponse({"ok": True, "email": user.email, "name": user.first_name})


def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)

    return JsonResponse({
        "authenticated": True,
        "email": request.user.email,
        "name": request.user.first_name,
    })


@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    logout(request)
    return JsonResponse({"ok": True})
