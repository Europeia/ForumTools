from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("dispatch", views.dispatch, name="dispatch"),
    path("send_dispatch", views.send_dispatch, name="send_dispatch")
]
