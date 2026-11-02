#!/usr/bin/env python3
import json
import os
from pathlib import Path

from aiohttp import WSMsgType, web

ROOT = Path(__file__).resolve().parent / "public"
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "3000"))

clients = set()
state = {
    "protocol": "Art-Net",
    "color": "#ff9f43",
    "brightness": 100,
    "effect": "Solid",
    "announcement": "Welcome to Neighbourhood Glow.",
    "videoCue": 0,
    "videos": [],
    "connected": True,
    "reducedBrightness": False,
}


async def broadcast_state():
    payload = {"type": "state", "state": state}
    dead_clients = set()
    for client in list(clients):
        try:
            await client.send_json(payload)
        except Exception:
            dead_clients.add(client)
    clients.difference_update(dead_clients)


async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    clients.add(ws)
    await ws.send_json({"type": "state", "state": state})

    try:
        async for message in ws:
            if message.type != WSMsgType.TEXT:
                continue

            try:
                payload = json.loads(message.data)
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "invalid-json"})
                continue

            message_type = payload.get("type")
            if message_type == "hello":
                await ws.send_json({"type": "hello", "ok": True})
                continue

            if message_type == "set_state":
                for key in (
                    "protocol",
                    "color",
                    "brightness",
                    "effect",
                    "announcement",
                    "videoCue",
                    "videos",
                    "connected",
                    "reducedBrightness",
                ):
                    if key in payload:
                        state[key] = payload[key]
                await broadcast_state()
                continue

            if message_type == "scene":
                if "color" in payload:
                    state["color"] = payload["color"]
                if "brightness" in payload:
                    state["brightness"] = payload["brightness"]
                if "effect" in payload:
                    state["effect"] = payload["effect"]
                if "announcement" in payload:
                    state["announcement"] = payload["announcement"]
                await broadcast_state()
    finally:
        clients.discard(ws)

    return ws


async def serve_file(pathname):
    file_path = ROOT / pathname.lstrip("/")
    if file_path.is_dir():
        file_path = file_path / "index.html"
    return web.FileResponse(file_path)


async def index_handler(request):
    return await serve_file("index.html")


async def audience_handler(request):
    return await serve_file("audience.html")


async def admin_handler(request):
    return await serve_file("admin.html")


app = web.Application()
app.router.add_get("/", index_handler)
app.router.add_get("/index.html", index_handler)
app.router.add_get("/audience", audience_handler)
app.router.add_get("/audience.html", audience_handler)
app.router.add_get("/admin", admin_handler)
app.router.add_get("/admin.html", admin_handler)
app.router.add_get("/ws", websocket_handler)
app.router.add_static("/", ROOT, show_index=False)


if __name__ == "__main__":
    web.run_app(app, host=HOST, port=PORT)
