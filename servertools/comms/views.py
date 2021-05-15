from comms.models import HTTPMethod, NSDispatch, NSDispatchForm, NSDispatchStatus
from django.http.response import Http404, HttpResponseNotAllowed
from django.shortcuts import render
from django.template import loader
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt

# Create your views here.


def index(request: HttpRequest):
    raise Http404()


def dispatch(request: HttpRequest):
    context = {"form": NSDispatchForm()}
    return render(request, "comms/dispatch.html", context)


@csrf_exempt
def send_dispatch(request: HttpRequest):
    if request.method != str(HTTPMethod.POST.value):
        return HttpResponseNotAllowed([str(HTTPMethod.POST.value)])

    form = NSDispatchForm(request.POST)
    new_dispatch = form.save(commit=False)
    new_dispatch.status = NSDispatchStatus.PREPARE
    return render(request, "comms/send_dispatch.html", {"dispatch": new_dispatch})
