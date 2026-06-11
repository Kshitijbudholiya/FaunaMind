import base64
import pickle
import threading
from io import BytesIO
from typing import Any, Dict, List, Optional, cast

import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models
from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0
from transformers import AutoModelForCausalLM, AutoTokenizer

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_animal_model: Optional[torch.nn.Module] = None
_animal_idx_to_label: Optional[Dict[int, str]] = None

_scene_model: Optional[torch.nn.Module] = None
_scene_classes: Optional[List[str]] = None

_story_tokenizer: Any = None
_story_model: Any = None

_generation_lock = threading.Lock()

_animal_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)

_scene_transform = transforms.Compose(
    [
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)


def _load_animal_model():
    global _animal_model
    global _animal_idx_to_label

    if _animal_model is not None:
        return

    model = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)

    for param in model.features.parameters():
        param.requires_grad = False

    classifier_layer = cast(torch.nn.Linear, model.classifier[1])

    model.classifier[1] = torch.nn.Linear(
        classifier_layer.in_features,
        241,
    )

    model.load_state_dict(
        torch.load(
            "./models/animal_model.pth",
            map_location=DEVICE,
        )
    )

    model = model.to(DEVICE)
    model.eval()

    _animal_model = model

    with open("./models/data_animal.pkl", "rb") as f:
        data = pickle.load(f)

    _animal_idx_to_label = data["idx_to_lable_map"]


def _load_scene_model():
    global _scene_model
    global _scene_classes

    if _scene_model is not None:
        return

    model = models.resnet50(num_classes=365)

    checkpoint = torch.load(
        "./models/resnet50_places365.pth.tar",
        map_location="cpu",
    )

    state_dict = {
        k.replace("module.", ""): v for k, v in checkpoint["state_dict"].items()
    }

    model.load_state_dict(state_dict)

    model = model.to(DEVICE)
    model.eval()

    _scene_model = model

    with open("./models/categories_places365.txt") as f:
        _scene_classes = [line.strip().split(" ")[0][3:] for line in f]


def _load_story_model():
    global _story_tokenizer
    global _story_model

    if _story_model is not None:
        return

    model_path = "./models/Qwen"

    _story_tokenizer = AutoTokenizer.from_pretrained(
        model_path,
        local_files_only=True,
    )

    _story_model = AutoModelForCausalLM.from_pretrained(
        model_path,
        local_files_only=True,
    ).to(DEVICE)

    _story_model.eval()


def _b64_to_pil(image_b64: str) -> Image.Image:
    image_bytes = base64.b64decode(image_b64)
    return Image.open(BytesIO(image_bytes)).convert("RGB")


def predict_animal(
    image_b64: str,
    top_k: int = 5,
) -> List[Dict]:
    _load_animal_model()

    assert _animal_model is not None
    assert _animal_idx_to_label is not None

    image_tensor = cast(
        torch.Tensor,
        _animal_transform(_b64_to_pil(image_b64)),
    )

    image = image_tensor.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        probs = torch.softmax(
            _animal_model(image),
            dim=1,
        )

        top_probs, top_idx = torch.topk(
            probs,
            top_k,
        )

    return [
        {
            "label": _animal_idx_to_label[int(idx.item())],
            "confidence": float(prob.item()),
        }
        for prob, idx in zip(
            top_probs[0],
            top_idx[0],
        )
    ]


def predict_scene(
    image_b64: str,
    top_k: int = 5,
) -> List[Dict]:
    _load_scene_model()

    assert _scene_model is not None
    assert _scene_classes is not None

    image_tensor = cast(
        torch.Tensor,
        _scene_transform(_b64_to_pil(image_b64)),
    )

    image = image_tensor.unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        probs = torch.softmax(
            _scene_model(image),
            dim=1,
        )

        top_probs, top_idx = probs.topk(top_k)

    return [
        {
            "label": _scene_classes[int(idx.item())],
            "confidence": float(prob.item()),
        }
        for prob, idx in zip(
            top_probs[0],
            top_idx[0],
        )
    ]


def _ask_model(
    messages: List[Dict],
    max_tokens: int = 300,
) -> str:
    _load_story_model()

    assert _story_tokenizer is not None
    assert _story_model is not None

    with _generation_lock:
        prompt = _story_tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = _story_tokenizer(
            prompt,
            return_tensors="pt",
        ).to(DEVICE)

        with torch.no_grad():
            outputs = _story_model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                repetition_penalty=1.1,
            )

        response = _story_tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1] :],
            skip_special_tokens=True,
        )

        return response.strip()


def start_story(
    animal: str,
    scene: str,
    theme: str = "adventure",
) -> str:
    return _ask_model(
        [
            {
                "role": "system",
                "content": (
                    "You are a children's storyteller. "
                    "Use third person narration. "
                    "Give the animal a name. "
                    "Do not end the story."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Animal: {animal}\n"
                    f"Scene: {scene}\n"
                    f"Theme: {theme}\n\n"
                    f"Start the story."
                ),
            },
        ]
    )


def continue_story(
    existing_story: str,
    direction: str,
) -> str:
    return _ask_model(
        [
            {
                "role": "system",
                "content": (
                    "Continue the story. "
                    "Do not restart it. "
                    "Keep names consistent. "
                    "Do not finish the story."
                ),
            },
            {
                "role": "user",
                "content": (f"Story:\n{existing_story}\n\n" f"Direction:\n{direction}"),
            },
        ]
    )


def answer_question(
    existing_story: str,
    question: str,
) -> str:
    return _ask_model(
        [
            {
                "role": "system",
                "content": (
                    "Answer only using the story. " "Do not invent new events."
                ),
            },
            {
                "role": "user",
                "content": (f"Story:\n{existing_story}\n\n" f"Question:\n{question}"),
            },
        ]
    )


def end_story(
    existing_story: str,
) -> str:
    return _ask_model(
        [
            {
                "role": "system",
                "content": ("Finish the story. " "Include a moral lesson."),
            },
            {
                "role": "user",
                "content": existing_story,
            },
        ]
    )


def generate_title(
    story: str,
) -> str:
    title = _ask_model(
        [
            {
                "role": "system",
                "content": (
                    "Generate only a short story title. "
                    "Maximum 6 words. "
                    "No quotes."
                ),
            },
            {
                "role": "user",
                "content": story,
            },
        ],
        max_tokens=20,
    )

    return title.replace("\n", " ").strip()


def detect_intent(text: str) -> str:
    text = text.lower().strip()

    if text in ("exit", "quit"):
        return "EXIT"

    if any(
        phrase in text
        for phrase in (
            "end story",
            "end the story",
            "finish story",
            "finish the story",
        )
    ):
        return "END_STORY"

    if text.startswith(
        (
            "who",
            "what",
            "where",
            "when",
            "why",
            "how",
            "which",
            "is",
            "are",
            "does",
            "did",
            "can",
        )
    ):
        return "QUESTION"

    return "STORY_CONTINUE"
