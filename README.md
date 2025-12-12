# EgyGuide
EgyGuide is a cross-platform intelligent agent designed to revolutionize the way tourists interact with historical and cultural landmarks in Egypt. By leveraging Deep Learning and LLMs, EgyGuide transforms a smartphone into a knowledgeable, virtual human like guide.

# EgyGuide: AI-Powered Intelligent Tourist Guide 🏛️

**Course:** CSAI 498 - Graduation Project 1  
**Supervisor:** Dr. Mohamed Maher Ata  
**Institution:** Zewail City of Science, Technology and Innovation  



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

## 🏗 Version 1 of the integrated usable website

How to run it:

* **1. clone the repo using:**
    * git clone https://github.com/zeyadsheriif/EgyGuide/tree/main

* **2. create a virtual env using:**
    * conda create -n ai_tourist python=3.10 -y
 
* **3. Activate the virtual enviroment using:**
    * conda activate ai_tourist
 
* **4. Install python dependencies using:**
    * pip install -r requirements.txt

* **5. Create a termainal and run:**
    * python vision_api.py

* **6. Crate another terminal and run:**
    * python app.py
