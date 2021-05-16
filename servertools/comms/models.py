from django.db import models
from django import forms
from enum import Enum

from django.db.models import fields

# Create your models here.


class HTTPMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    OPTIONS = "OPTIONS"
    DELETE = "DELETE"
    PATCH = "PATCH"


class NSDispatchStatus(Enum):
    START = "Start"
    PREPARE = "Prepare"
    COMPLETE = "Complete"
    DELETE = "Deleted"


class NSDispatch(models.Model):
    title = models.CharField(max_length=200)
    text = models.TextField(verbose_name="dispatch_text")
    dispatch_id = models.IntegerField(default=0)
    category = models.IntegerField(default=0)
    subcategory = models.IntegerField(default=0)
    status = models.CharField(max_length=15, choices=[(tag, tag.value) for tag in NSDispatchStatus])


class NSDispatchForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_suffix = ""

    class Meta:
        model = NSDispatch
        exclude = ["category", "subcategory", "status"]
        labels = {"text": "Text", "title": "Title", "dispatch_id": "Dispatch Id"}

    def save(self, *args, **kwargs) -> NSDispatch:
        return super().save(*args, **kwargs)
