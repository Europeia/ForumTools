import requests
from typing import Any
from lxml import html
from enum import Enum

DEBUG = True
DEBUG_PROXY = False
API_URL = "https://www.nationstates.net/cgi-bin/api.cgi"
current_pin = ""


def submitRequestAndReturnSuccessMessage(params: "dict[str, Any]") -> str:
    global current_pin
    prepare_params = {**params, "nation": "Darcness"}
    prepare_headers = {"User-Agent": "EuroTools v.1.0.0"}

    if len(current_pin) == 0:
        prepare_headers["X-Autologin"] = ".omIzDydC0DTwlzpT7UqDJw"
    else:
        prepare_headers["X-Pin"] = current_pin

    proxyDict = {}

    if DEBUG_PROXY:
        proxyDict["http"] = "192.168.254.14:8888"
        proxyDict["https"] = "192.168.254.14:8888"

    r = requests.get(
        API_URL,
        params=prepare_params,
        headers=prepare_headers,
        proxies=proxyDict,
        verify="/etc/ssl/certs/ca-certificates.crt",
    )

    if DEBUG:
        print(params)
        print(r.__dict__)

    pin = r.headers.get("X-Pin")

    if pin is None or len(pin) > 0:
        current_pin = pin

    tree = html.fromstring(r.content)
    success_msg = tree.xpath("//success/text()")

    if len(success_msg) < 1:
        return ""

    return success_msg[0]


class DispatchSubmitType(Enum):
    Add = "add"
    Edit = "edit"
    Delete = "delete"


def submitDispatchPrepare(params: "dict[str, Any]", type: DispatchSubmitType) -> str:
    if type != DispatchSubmitType.Add and len(params["dispatchid"]) == 0:
        print("Dispatch Edit/Delete is missing dispatchid!")
        return ""

    return submitRequestAndReturnSuccessMessage(
        {**params, "c": "dispatch", "dispatch": str(type.value), "mode": "prepare"}
    )


def submitDispatchExecute(params: "dict[str, Any]", type: DispatchSubmitType, token: str) -> str:
    if type != DispatchSubmitType.Add and len(params["dispatchid"]) == 0:
        print("Dispatch Edit/Delete is missing dispatchid!")
        return ""

    return submitRequestAndReturnSuccessMessage(
        {**params, "c": "dispatch", "dispatch": str(type.value), "mode": "execute", "token": token}
    )
