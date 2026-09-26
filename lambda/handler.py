import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
}


def _response(status_code, body=None):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body) if body is not None else "",
    }


def _now():
    return datetime.now(timezone.utc).isoformat()


def list_tasks():
    items = table.scan().get("Items", [])
    items.sort(key=lambda item: item.get("createdAt", ""))
    return _response(200, items)


def get_task(task_id):
    result = table.get_item(Key={"id": task_id})
    item = result.get("Item")
    if item is None:
        return _response(404, {"message": "Task not found"})
    return _response(200, item)


def create_task(payload):
    title = (payload or {}).get("title", "").strip()
    if not title:
        return _response(400, {"message": "title is required"})

    now = _now()
    item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "completed": bool((payload or {}).get("completed", False)),
        "createdAt": now,
        "updatedAt": now,
    }
    table.put_item(Item=item)
    return _response(201, item)


def update_task(task_id, payload):
    result = table.get_item(Key={"id": task_id})
    item = result.get("Item")
    if item is None:
        return _response(404, {"message": "Task not found"})

    payload = payload or {}
    if "title" in payload:
        title = str(payload["title"]).strip()
        if not title:
            return _response(400, {"message": "title cannot be empty"})
        item["title"] = title
    if "completed" in payload:
        item["completed"] = bool(payload["completed"])
    item["updatedAt"] = _now()

    table.put_item(Item=item)
    return _response(200, item)


def delete_task(task_id):
    result = table.get_item(Key={"id": task_id})
    if result.get("Item") is None:
        return _response(404, {"message": "Task not found"})
    table.delete_item(Key={"id": task_id})
    return _response(204)


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    if method == "OPTIONS":
        return _response(200)

    path_params = event.get("pathParameters") or {}
    task_id = path_params.get("id")

    body = None
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return _response(400, {"message": "Invalid JSON body"})

    try:
        if method == "GET" and task_id is None:
            return list_tasks()
        if method == "GET" and task_id is not None:
            return get_task(task_id)
        if method == "POST" and task_id is None:
            return create_task(body)
        if method == "PUT" and task_id is not None:
            return update_task(task_id, body)
        if method == "DELETE" and task_id is not None:
            return delete_task(task_id)
    except Exception as exc:  # pragma: no cover - defensive log for CloudWatch
        print(f"Unhandled error: {exc}")
        return _response(500, {"message": "Internal server error"})

    return _response(404, {"message": "Route not found"})
