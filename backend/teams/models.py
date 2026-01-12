from django.db import models
from django.contrib.auth.models import User


class Team(models.Model):
    captain = models.OneToOneField(User, on_delete=models.CASCADE, related_name="team")
    name = models.CharField(max_length=120, blank=True, default="")
    slogan = models.CharField(max_length=255, blank=True, default="")
    created_date = models.DateField(null=True, blank=True)

    # por enquanto: guardar como DATA URL/base64 ou URL (o front decide)
    logo_data = models.TextField(blank=True, default="")
    banner_data = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        return {
            "name": self.name or "",
            "slogan": self.slogan or "",
            "created_date": self.created_date.isoformat() if self.created_date else "",
            "logo_data": self.logo_data or "",
            "banner_data": self.banner_data or "",
        }


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="members")
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)


class TeamRobot(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="robots")
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)
