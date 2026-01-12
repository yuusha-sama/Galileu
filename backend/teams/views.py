import json
from datetime import date
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Team, TeamMember, TeamRobot


def _require_auth(request):
    if not request.user.is_authenticated:
        return None, JsonResponse({"detail": "Não autenticado"}, status=401)
    return request.user, None


def _get_or_create_team(user):
    team, _ = Team.objects.get_or_create(captain=user)
    return team


def _parse_json(request):
    try:
        raw = request.body.decode("utf-8") or "{}"
        return json.loads(raw)
    except Exception:
        return None


@csrf_exempt
def team_me(request):
    user, err = _require_auth(request)
    if err:
        return err

    team = _get_or_create_team(user)

    if request.method == "GET":
        return JsonResponse({
            "ok": True,
            "team": team.to_dict(),
            "members": [{"id": m.id, "name": m.name} for m in team.members.order_by("id")],
            "robots": [{"id": r.id, "name": r.name} for r in team.robots.order_by("id")],
        })

    if request.method in ("POST", "PUT", "PATCH"):
        data = _parse_json(request)
        if data is None:
            return JsonResponse({"detail": "JSON inválido"}, status=400)

        if "name" in data:
            team.name = (data.get("name") or "").strip()

        if "slogan" in data:
            team.slogan = (data.get("slogan") or "").strip()

        if "logo_data" in data:
            team.logo_data = data.get("logo_data") or ""

        if "banner_data" in data:
            team.banner_data = data.get("banner_data") or ""

        if "created_date" in data:
            v = (data.get("created_date") or "").strip()
            if v:
                try:
                    y, m, d = v.split("-")
                    team.created_date = date(int(y), int(m), int(d))
                except Exception:
                    return JsonResponse({"detail": "created_date deve ser YYYY-MM-DD"}, status=400)
            else:
                team.created_date = None

        team.save()

        return JsonResponse({"ok": True, "team": team.to_dict()})

    return JsonResponse({"detail": "Method not allowed"}, status=405)


@csrf_exempt
def members(request):
    user, err = _require_auth(request)
    if err:
        return err
    team = _get_or_create_team(user)

    if request.method == "GET":
        return JsonResponse({
            "ok": True,
            "members": [{"id": m.id, "name": m.name} for m in team.members.order_by("id")],
        })

    if request.method == "POST":
        data = _parse_json(request)
        if data is None:
            return JsonResponse({"detail": "JSON inválido"}, status=400)

        name = (data.get("name") or "").strip()
        if not name:
            return JsonResponse({"detail": "Nome é obrigatório"}, status=400)

        m = TeamMember.objects.create(team=team, name=name)
        return JsonResponse({"ok": True, "id": m.id, "name": m.name})

    return JsonResponse({"detail": "Method not allowed"}, status=405)


@csrf_exempt
def member_delete(request, pk: int):
    user, err = _require_auth(request)
    if err:
        return err
    team = _get_or_create_team(user)

    if request.method != "DELETE":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    TeamMember.objects.filter(team=team, id=pk).delete()
    return JsonResponse({"ok": True})


@csrf_exempt
def robots(request):
    user, err = _require_auth(request)
    if err:
        return err
    team = _get_or_create_team(user)

    if request.method == "GET":
        return JsonResponse({
            "ok": True,
            "robots": [{"id": r.id, "name": r.name} for r in team.robots.order_by("id")],
        })

    if request.method == "POST":
        data = _parse_json(request)
        if data is None:
            return JsonResponse({"detail": "JSON inválido"}, status=400)

        name = (data.get("name") or "").strip()
        if not name:
            return JsonResponse({"detail": "Nome é obrigatório"}, status=400)

        r = TeamRobot.objects.create(team=team, name=name)
        return JsonResponse({"ok": True, "id": r.id, "name": r.name})

    return JsonResponse({"detail": "Method not allowed"}, status=405)


@csrf_exempt
def robot_delete(request, pk: int):
    user, err = _require_auth(request)
    if err:
        return err
    team = _get_or_create_team(user)

    if request.method != "DELETE":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    TeamRobot.objects.filter(team=team, id=pk).delete()
    return JsonResponse({"ok": True})
