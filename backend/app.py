from flask import Flask, request, jsonify
from flask_cors import CORS

import base64
import csv
import io
import os
from uuid import uuid4
from datetime import datetime

import requests
from PIL import Image

from model_helper import (
    predict_animal,
    predict_scene,
    start_story,
    continue_story,
    answer_question,
    end_story,
    detect_intent,
    generate_title,
)

from storage import (
    save_session,
    load_session,
    delete_session,
    list_sessions,
)

app = Flask(__name__)
CORS(app)

os.makedirs("data", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

DATASET_FILE = "data/dataset.csv"

DATASET_FIELDS = [
    "animal",
    "scene",
    "story",
    "updated_at",
]


def create_session():
    now = datetime.utcnow().isoformat()

    return {
        "id": str(uuid4()),
        "title": "New Story",
        "animal": "",
        "scene": "",
        "image_b64": "",
        "story": "",
        "story_active": True,
        "dataset_saved": False,
        "created_at": now,
        "updated_at": now,
        "messages": [],
    }


def get_or_create_session(session_id=None):

    if session_id:
        existing = load_session(session_id)

        if existing:
            return existing["id"], existing

    session = create_session()

    save_session(session)

    return session["id"], session


def append_message(
    session,
    role,
    content,
    extra=None,
):
    entry = {
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
    }

    if extra:
        entry.update(extra)

    session["messages"].append(entry)


def load_dataset():

    if not os.path.exists(DATASET_FILE):
        return []

    with open(
        DATASET_FILE,
        newline="",
        encoding="utf-8",
    ) as f:
        return list(csv.DictReader(f))


def save_dataset(rows):

    with open(
        DATASET_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=DATASET_FIELDS,
        )

        writer.writeheader()
        writer.writerows(rows)


def story_exists(
    rows,
    story,
):
    story = story.strip()

    for idx, row in enumerate(rows):

        if row.get("story", "").strip() == story:
            return idx

    return None


def upsert_dataset(
    animal,
    scene,
    story,
):
    rows = load_dataset()

    idx = story_exists(
        rows,
        story,
    )

    if idx is not None:

        rows[idx]["animal"] = animal
        rows[idx]["scene"] = scene
        rows[idx]["story"] = story
        rows[idx]["updated_at"] = datetime.utcnow().isoformat()

    else:

        rows.append(
            {
                "animal": animal,
                "scene": scene,
                "story": story,
                "updated_at": datetime.utcnow().isoformat(),
            }
        )

    save_dataset(rows)


@app.route(
    "/api/health",
    methods=["GET"],
)
def health():

    return jsonify(
        {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


@app.route(
    "/api/sessions",
    methods=["GET"],
)
def sessions_endpoint():

    sessions = list_sessions()

    result = []

    for session in sessions:

        result.append(
            {
                "id": session["id"],
                "title": session.get(
                    "title",
                    "Untitled Story",
                ),
                "animal": session.get(
                    "animal",
                    "",
                ),
                "scene": session.get(
                    "scene",
                    "",
                ),
                "updated_at": session.get(
                    "updated_at",
                    "",
                ),
            }
        )

    return jsonify(result)


@app.route(
    "/api/session/<session_id>",
    methods=["GET"],
)
def get_session_endpoint(
    session_id,
):
    session = load_session(session_id)

    if not session:
        return (
            jsonify({"error": "Session not found"}),
            404,
        )

    return jsonify(session)


@app.route(
    "/api/session/<session_id>",
    methods=["DELETE"],
)
def delete_session_endpoint(
    session_id,
):
    delete_session(session_id)

    return jsonify({"status": "deleted"})


@app.route(
    "/api/image/upload",
    methods=["POST"],
)
def upload_image():

    if "file" not in request.files:
        return (
            jsonify({"error": "No file provided"}),
            400,
        )

    file = request.files["file"]

    try:

        image = Image.open(file.stream)

        width, height = image.size

        buffer = io.BytesIO()

        image.save(
            buffer,
            format=image.format or "PNG",
        )

        image_b64 = base64.b64encode(buffer.getvalue()).decode()

        return jsonify(
            {
                "image_b64": image_b64,
                "width": width,
                "height": height,
                "mime": f"image/{(image.format or 'png').lower()}",
                "filename": file.filename,
            }
        )

    except Exception as e:

        return (
            jsonify({"error": str(e)}),
            500,
        )


@app.route(
    "/api/image/url",
    methods=["POST"],
)
def image_url():

    data = request.get_json() or {}

    url = data.get(
        "url",
        "",
    ).strip()

    if not url:

        return (
            jsonify({"error": "No URL provided"}),
            400,
        )

    try:

        response = requests.get(
            url,
            timeout=15,
        )

        response.raise_for_status()

        image = Image.open(io.BytesIO(response.content))

        width, height = image.size

        buffer = io.BytesIO()

        image.save(
            buffer,
            format=image.format or "PNG",
        )

        image_b64 = base64.b64encode(buffer.getvalue()).decode()

        return jsonify(
            {
                "image_b64": image_b64,
                "width": width,
                "height": height,
                "mime": f"image/{(image.format or 'png').lower()}",
                "source_url": url,
            }
        )

    except Exception as e:

        return (
            jsonify({"error": str(e)}),
            400,
        )


@app.route(
    "/api/story/start",
    methods=["POST"],
)
def story_start():

    data = request.get_json() or {}

    image_b64 = data.get(
        "image_b64",
        "",
    )

    theme = data.get(
        "theme",
        "adventure",
    )

    if not image_b64:

        return (
            jsonify({"error": "image_b64 required"}),
            400,
        )

    try:

        animal_predictions = predict_animal(
            image_b64,
            top_k=3,
        )

        scene_predictions = predict_scene(
            image_b64,
            top_k=3,
        )

        if not animal_predictions:

            return (
                jsonify({"error": "Animal detection failed"}),
                500,
            )

        if not scene_predictions:

            return (
                jsonify({"error": "Scene detection failed"}),
                500,
            )

        animal = animal_predictions[0]["label"]

        scene = scene_predictions[0]["label"]

        story = start_story(
            animal=animal,
            scene=scene,
            theme=theme,
        )

        title = generate_title(story)

        session = create_session()

        session["title"] = title
        session["animal"] = animal
        session["scene"] = scene
        session["image_b64"] = image_b64
        session["story"] = story
        session["story_active"] = True

        append_message(
            session,
            "assistant",
            story,
        )

        if not session["dataset_saved"]:

            upsert_dataset(
                animal,
                scene,
                story,
            )

            session["dataset_saved"] = True

        save_session(session)

        return jsonify(
            {
                "session_id": session["id"],
                "title": title,
                "animal": animal,
                "scene": scene,
                "story": story,
                "image_b64": image_b64,
                "animal_predictions": animal_predictions,
                "scene_predictions": scene_predictions,
            }
        )

    except Exception as e:

        return (
            jsonify({"error": str(e)}),
            500,
        )


@app.route(
    "/api/story/chat",
    methods=["POST"],
)
def story_chat():

    data = request.get_json() or {}

    session_id = data.get("session_id", "")

    message = data.get("message", "").strip()

    if not session_id:

        return (
            jsonify({"error": "session_id required"}),
            400,
        )

    if not message:

        return (
            jsonify({"error": "message required"}),
            400,
        )

    session = load_session(session_id)

    if not session:

        return (
            jsonify({"error": "Session not found"}),
            404,
        )

    intent = detect_intent(message)

    if intent == "END_STORY":

        reply = end_story(session["story"])

        session["story"] += "\n\n" + reply

        session["story_active"] = False

    elif intent == "QUESTION":

        reply = answer_question(
            session["story"],
            message,
        )

    else:

        reply = continue_story(
            session["story"],
            message,
        )

        session["story"] += "\n\n" + reply

    append_message(
        session,
        "user",
        message,
    )

    append_message(
        session,
        "assistant",
        reply,
        {"intent": intent},
    )

    save_session(session)

    return jsonify(
        {
            "reply": reply,
            "intent": intent,
            "story_active": session["story_active"],
        }
    )


@app.route(
    "/api/dataset",
    methods=["GET"],
)
def dataset_get():

    return jsonify({"rows": load_dataset()})


@app.route(
    "/api/dataset",
    methods=["POST"],
)
def dataset_add():

    data = request.get_json() or {}

    animal = data.get(
        "animal",
        "",
    ).strip()

    scene = data.get(
        "scene",
        "",
    ).strip()

    story = data.get(
        "story",
        "",
    ).strip()

    if not animal:

        return (
            jsonify({"error": "animal required"}),
            400,
        )

    if not scene:

        return (
            jsonify({"error": "scene required"}),
            400,
        )

    if not story:

        return (
            jsonify({"error": "story required"}),
            400,
        )

    rows = load_dataset()

    rows.append(
        {
            "animal": animal,
            "scene": scene,
            "story": story,
            "updated_at": datetime.utcnow().isoformat(),
        }
    )

    save_dataset(rows)

    return jsonify(
        {
            "status": "added",
            "total": len(rows),
        }
    )


@app.route(
    "/api/dataset/<int:index>",
    methods=["PUT"],
)
def dataset_update(index):
    rows = load_dataset()

    if index < 0 or index >= len(rows):
        return (
            jsonify({"error": "Index out of range"}),
            400,
        )

    data = request.get_json() or {}

    rows[index]["animal"] = data.get(
        "animal",
        rows[index]["animal"],
    )

    rows[index]["scene"] = data.get(
        "scene",
        rows[index]["scene"],
    )

    rows[index]["story"] = data.get(
        "story",
        rows[index]["story"],
    )

    rows[index]["updated_at"] = datetime.utcnow().isoformat()

    save_dataset(rows)

    return jsonify(
        {
            "status": "updated",
            "row": rows[index],
        }
    )


@app.route(
    "/api/dataset/<int:index>",
    methods=["DELETE"],
)
def dataset_delete(index):
    rows = load_dataset()

    if index < 0 or index >= len(rows):
        return (
            jsonify({"error": "Index out of range"}),
            400,
        )

    rows.pop(index)

    save_dataset(rows)

    return jsonify(
        {
            "status": "deleted",
            "total": len(rows),
        }
    )


@app.route(
    "/api/session/<session_id>/rename",
    methods=["PUT"],
)
def rename_session(session_id):
    session = load_session(session_id)

    if not session:

        return (
            jsonify({"error": "Session not found"}),
            404,
        )

    data = request.get_json() or {}

    title = data.get(
        "title",
        "",
    ).strip()

    if title:

        session["title"] = title

        save_session(session)

    return jsonify(
        {
            "status": "updated",
            "title": session["title"],
        }
    )


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
