from comms.models import HTTPMethod, NSDispatch, NSDispatchForm, NSDispatchStatus
from django.http.response import Http404, HttpResponseNotAllowed
from django.shortcuts import render
from django.template import loader
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
import requests
import time
import certifi
from lxml import html

# Create your views here.
api_url = "https://www.nationstates.net/cgi-bin/api.cgi"
DEBUG_PROXY = False


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
    new_dispatch.status = NSDispatchStatus.START
    new_dispatch.category = 3
    new_dispatch.subcategory = 315
    # new_dispatch.save()

    prepare_params = {
        "nation": "Darcness",
        "c": "dispatch",
        "dispatch": "add",
        "title": new_dispatch.title,
        "text": new_dispatch.text,
        "category": new_dispatch.category,
        "subcategory": new_dispatch.subcategory,
        "mode": "prepare",
    }

    prepare_headers = {"X-Autologin": ".omIzDydC0DTwlzpT7UqDJw", "User-Agent": "EuroTools"}

    proxyDict = {}

    if DEBUG_PROXY:
        proxyDict["http"] = "192.168.254.14:8888"
        proxyDict["https"] = "192.168.254.14:8888"

    r = requests.get(
        api_url,
        params=prepare_params,
        headers=prepare_headers,
        proxies=proxyDict,
        verify="/etc/ssl/certs/ca-certificates.crt",
    )

    tree = html.fromstring(r.content)
    tokens = tree.xpath("//success/text()")

    # we have a token, so we can make a response
    if len(tokens) > 0:
        token = tokens[0]

        prepare_params["mode"] = "execute"
        prepare_params["token"] = token
        pin = r.headers["X-Pin"]

        if len(pin) > 0:
            prepare_headers["X-Pin"] = pin
            prepare_headers["X-Autologin"] = None

        time.sleep(20)
        r2 = requests.get(
            api_url,
            params=prepare_params,
            headers=prepare_headers,
            proxies=proxyDict,
            verify="/etc/ssl/certs/ca-certificates.crt",
        )

    return render(request, "comms/send_dispatch.html", {"dispatch": r2.__dict__})
