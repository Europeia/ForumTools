from comms.helpers import DispatchSubmitType, submitDispatchExecute, submitDispatchPrepare
from comms.models import HTTPMethod, NSDispatchForm, NSDispatchStatus
from django.http.response import Http404, HttpResponseNotAllowed
from django.shortcuts import render
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
import re

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

    output = "Unknown error"
    form = NSDispatchForm(request.POST)
    new_dispatch = form.save(commit=False)
    new_dispatch.status = NSDispatchStatus.START
    new_dispatch.category = 3
    new_dispatch.subcategory = 315
    new_dispatch.save()

    prepare_params = {
        "title": new_dispatch.title,
        "text": new_dispatch.text,
        "category": new_dispatch.category,
        "subcategory": new_dispatch.subcategory,
    }

    token = submitDispatchPrepare(prepare_params, DispatchSubmitType.Add)

    new_dispatch.status = NSDispatchStatus.PREPARE
    new_dispatch.save()

    # we have a token, so we can make a response
    if len(token) > 0:
        success_msg = submitDispatchExecute(prepare_params, DispatchSubmitType.Add, token)

        new_dispatch.status = NSDispatchStatus.COMPLETE
        new_dispatch.save()

        success_msg_regex = re.search("dispatch\/id=(\d*)", success_msg)

        if len(success_msg_regex.groups()) > 0:
            # We have a dispatch Id!
            output = "Successfully added Dispatch! Id: " + success_msg_regex.group(1)

    return render(request, "comms/send_dispatch.html", {"dispatch": output})
