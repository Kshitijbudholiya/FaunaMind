# 🦁 FaunaMind: Animal Scene Analysis and AI Story Generation

FaunaMind is an AI-powered wildlife intelligence platform that combines computer vision, scene understanding, and local large language models to analyze animal images and generate engaging wildlife stories.

The system identifies animals, understands their surrounding environment, generates contextual insights, and creates AI-powered narratives using a locally hosted Qwen language model.

---

# ✨ Features

### 📸 Animal Classification

* Upload wildlife images for analysis.
* Detect and classify animal species using a fine-tuned EfficientNet-B0 model.
* Supports a wide range of animal categories through merged training datasets.

### 🌍 Scene Recognition

* Analyze environmental context using Places365 scene recognition.
* Identify habitats and surroundings.
* Enhance animal analysis with contextual ecosystem information.

### 📖 AI Story Generation

* Generate immersive wildlife stories.
* Create narratives based on detected animals and habitat information.
* Produce educational and creative content.

### 💬 Interactive Chat Assistant

* Ask questions about uploaded images.
* Explore animal behavior and habitat information.
* Generate follow-up stories and explanations.

### 📊 Dataset Management

* View previously analyzed images.
* Edit and manage stored records.
* Maintain a growing wildlife observation database.

---

# 🏗️ Project Structure

```text
FAUNAMIND/
│
├── backend/
│   ├── data/
│   │
│   ├── models/
│   │   ├── Qwen/
│   │   ├── animal_model.pth
│   │   ├── categories_places365.txt
│   │   ├── data_animal.pkl
│   │   └── resnet50_places365.pth.tar
│   │
│   ├── uploads/
│   │
│   ├── app.py
│   ├── model_helper.py
│   └── storage.py
│
├── src/
│   ├── components/
│   │   ├── AnalysisCards.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── DatasetEditor.jsx
│   │   ├── DatasetViewer.jsx
│   │   ├── ImageUploader.jsx
│   │   └── StoryViewer.jsx
│   │
│   ├── layout/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

---

# ⚙️ Technology Stack

## Frontend

* React-js

## Backend

* Flask
* Python

---

# 🤖 Machine Learning Pipeline

FaunaMind combines multiple AI components to create a complete wildlife analysis workflow.

```text
Image Upload
      │
      ▼
EfficientNet-B0
(Animal Classification)
      │
      ▼
Places365 ResNet50
(Scene Recognition)
      │
      ▼
Analysis Generation
      │
      ▼
Local Qwen LLM
(Story & Chat Generation)
```

---

## 🐾 Animal Classification

FaunaMind uses a fine-tuned EfficientNet-B0 model for animal recognition.

The model is initialized with ImageNet-pretrained weights and adapted for wildlife classification through transfer learning.

### Model Architecture

```python
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

model = efficientnet_b0(weights=EfficientNet_B0_Weights.IMAGENET1K_V1)

for param in model.features.parameters():
    param.requires_grad = False

model.classifier = torch.nn.Linear(
    model.classifier.in_features,
    num_classes
)
```

### Training Strategy

* Transfer Learning
* ImageNet Pretrained Weights
* Frozen Feature Extractor Layers
* Custom Classification Head
* Fine-tuned on merged wildlife datasets

### Training Datasets

#### Animals-141 Dataset

Source:
https://www.kaggle.com/datasets/sharansmenon/animals141

#### Animal Image Dataset – 90 Different Animals

Source:
https://www.kaggle.com/datasets/iamsouravbanerjee/animal-image-dataset-90-different-animals

### Dataset Preparation

Both datasets were merged into a unified training dataset to:

* Increase species diversity
* Improve model generalization
* Expand classification coverage
* Reduce dataset bias

---

## 🌍 Scene Recognition

Environmental understanding is performed using a pre-trained Places365 ResNet50 model.

### Model

* ResNet50 Places365
* Pre-trained on the Places365 dataset
* No additional fine-tuning required

### Capabilities

* Habitat Recognition
* Environment Classification
* Scene Understanding
* Context-Aware Analysis

Examples:

* Forest
* Savannah
* Grassland
* Desert
* Mountain
* Wetland
* Urban Areas

This information is combined with animal predictions to produce richer ecological insights.

---

## 🧠 Large Language Model

FaunaMind uses a locally hosted Qwen model for text generation.

### Responsibilities

* Wildlife Story Generation
* Animal Explanations
* Habitat Descriptions
* Interactive Question Answering
* Educational Content Creation

### Benefits of Local Deployment

* No API Costs
* Improved Privacy
* Offline Capability
* Faster Development Iteration
* Full Control Over Model Usage

---

# 🔄 Application Workflow

1. User uploads an animal image.
2. EfficientNet-B0 classifies the animal.
3. Places365 identifies the surrounding environment.
4. Analysis engine combines animal and scene information.
5. Qwen generates:

   * Animal insights
   * Habitat descriptions
   * Wildlife stories
   * Chat responses
6. Results are stored and displayed through the user interface.

---

# 📂 Backend Components

## app.py

Main Flask application.

Responsibilities:

* API endpoints
* Image uploads
* Model inference requests
* Story generation requests
* Chat interactions

---

## model_helper.py

Handles:

* Loading machine learning models
* Animal prediction
* Scene classification
* Analysis generation

---

## storage.py

Responsible for:

* Dataset storage
* Analysis persistence
* Story history
* Record management

---

# 🎨 Frontend Components

| Component     | Description                            |
| ------------- | -------------------------------------- |
| ImageUploader | Upload animal images                   |
| AnalysisCards | Display model predictions and insights |
| StoryViewer   | Show generated wildlife stories        |
| ChatPanel     | Interactive AI chat interface          |
| DatasetViewer | Browse stored analyses                 |
| DatasetEditor | Edit and manage stored datasets        |

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/FaunaMind.git
cd FaunaMind
```

---

## Backend Setup

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
python app.py
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

Return to project root:

```bash
cd ..
```

Install packages:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 🚀 Future Improvements

* Multi-animal interaction analysis
* Wildlife behavior prediction
* Species relationship detection
* Conservation recommendation system
* Geolocation-aware habitat analysis
* Video-based wildlife analysis
* RAG-powered wildlife knowledge base
* Multi-language storytelling
* Voice narration support

---

# 📸 Example Use Case

### Input

User uploads an image containing a lion standing in a grassland environment.

### Analysis

Animal Classification:

* Lion

Scene Recognition:

* Savannah
* Grassland

### Generated Output

* Animal insights
* Habitat information
* Wildlife story
* Interactive AI discussion

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add feature"
```

4. Push to GitHub.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📜 License

This project is licensed under the MIT License.

See the LICENSE file for details.

---

# 👨‍💻 Author

**Kshitij Budholiya**

AI/ML Developer | Computer Vision Enthusiast | Generative AI Explorer

**FaunaMind — Where Wildlife Meets Artificial Intelligence.**
