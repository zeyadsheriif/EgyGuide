# EgyGuide
EgyGuide is a cross-platform intelligent agent designed to revolutionize the way tourists interact with historical and cultural landmarks in Egypt. By leveraging Deep Learning and LLMs, EgyGuide transforms a smartphone into a knowledgeable, virtual human like guide.

# EgyGuide: AI-Powered Intelligent Tourist Guide 🏛️

**Course:** CSAI 498 - Graduation Project 1  
**Supervisor:** Dr. Mohamed Maher Ata  
**Institution:** Zewail City of Science, Technology and Innovation  

---

## 📋 Table of Contents
1. [Project Summary](#-project-summary)
2. [Team Members](#-team-members)
3. [Progress Report](#-progress-since-proposal)
4. [System Architecture](#-system-architecture)
5. [Component Breakdown](#-component-breakdown)
6. [Work Breakdown Structure](#-work-breakdown-structure)
7. [Risk Analysis](#-risk-analysis)

---

## 📝 Project Summary
**EgyGuide** is a cross-platform intelligent agent designed to revolutionize the cultural tourism experience in Egypt. The system addresses the "shallow" tourism experience caused by a lack of accessible and engaging historical information.

The solution integrates two core AI technologies:
* **Deep Learning (Computer Vision):** Utilizing CNN architectures (EfficientNet/ResNet) to instantly recognize monuments and artifacts from user photos.
* **Natural Language Processing (NLP):** Leveraging Transformer-based LLMs to engage users in natural, interactive conversations, answering specific follow-up questions.

---

## 👥 Team Members

| Name | ID | Role | Email |
| :--- | :--- | :--- | :--- |
| **Zeyad Sherif** | 202201220 | DL Model & Mobile Frontend | s-zeyad.gamal@zewailcity.edu.eg |
| **Sama Mohamed** | 202201867 | NLP Model & Mobile Backend | s-sama.abdelhamid@zewailcity.edu.eg |
| **Salma Wael** | 202201761 | DL Model & Web Frontend | s-salma.ramzy@zewailcity.edu.eg |
| **Dana Amr** | 202201323 | NLP Model & Web Backend | s-dana.marei@zewailcity.edu.eg |

---

## 📈 Progress Since Proposal (Weeks 4-9)

Since the submission of the project proposal in October 2025, the team has completed **Phase 1 (Research & Data)** and entered **Phase 2 (AI Model Development)**.

### Key Tasks Completed:
* **Market & Requirements Analysis:** Defined the "Modern Cultural Explorer" persona and finalized functional requirements.
* **Data Collection:**
    * Curated structured datasets from museum archives and open sources.
    * Performed data cleaning and augmentation for the vision model.
* **Model Selection:**
    * **Vision:** Selected EfficientNet and ResNet for experimentation.
    * **NLP:** Selected Transformer-based models (LLaMA/Mistral) for fine-tuning.

---

## 🏗 System Architecture

The system follows a microservices-oriented architecture to ensure scalability.

### High-Level Diagram
```mermaid
graph TD
    User[User Smartphone/Web] -->|Upload Image| Frontend
    Frontend[Frontend App (Flutter/Angular)] -->|API Request| API[API Gateway (Flask/FastAPI)]
    API -->|Process Image| DL[Vision Model (CNN)]
    DL -->|Return Landmark ID| API
    API -->|Get Metadata| DB[(Database)]
    API -->|Context + Query| NLP[LLM Chatbot]
    NLP -->|Response| API
    API -->|Final Response| Frontend
