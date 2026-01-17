from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # Dados básicos (hoje só pra exibir na página, amanhã pode evoluir)
    cpf = models.CharField(max_length=14, blank=True, default="")
    birthdate = models.DateField(null=True, blank=True)

    # Foto em data URL (base64) pra simplificar o MVP
    photo_data = models.TextField(blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    def to_dict(self):
        return {
            "cpf": self.cpf or "",
            "birthdate": self.birthdate.isoformat() if self.birthdate else "",
            "photo_data": self.photo_data or "",
        }


@receiver(post_save, sender=User)
def create_profile(sender, instance: User, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
