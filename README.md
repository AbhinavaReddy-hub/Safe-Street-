# 🛣️ SafeStreet - Road Damage Detection and Alert System

SafeStreet is an AI-powered platform designed to identify, assess, and prioritize road damage reports using computer vision, location metadata, and automated workflows. It consists of a mobile app for users and workers, and a web platform for authorities to manage and monitor infrastructure repair efficiently.

---

## 🚀 Project Overview

Poor road conditions are a major safety and economic concern. SafeStreet empowers local communities and authorities with:

- ✅ Real-time damage detection
- 🧠 Vision Transformer CNN + DETR model for classification and severity assessment
- 📊 Historical analysis and dashboard for authorities
- 🔔 Automated alerts and repair task generation

---

## 🧱 System Architecture

```txt
            ┌────────────┐       Upload Image + Metadata       ┌────────────┐
            │   Mobile   │ ──────────────────────────────────▶ │   Backend  │
            │   (App)    │                                    │ (Node.js)  │
            └────────────┘                                    └────┬───────┘
                                                                   │
             ┌────────────┐     Review & Analysis + Status        ▼
             │ Authorities│ ◀──────────────────────────────┬┐  ┌────────────┐
             │  (Website) │                                └──▶│  Database  │
             └────────────┘                                   └────────────┘
```

- **App Users (Citizens/Workers):** Upload road damage photos via the app
- **Backend Server:** Processes data, classifies severity, stores to MongoDB, and triggers alerts
- **Authorities:** Web dashboard to visualize and manage incoming reports

---

## 👥 User Roles

| Role       | Access Interface | Capabilities |
|------------|------------------|--------------|
| **User**   | Mobile App        | Upload image, view status, history |
| **Worker** | Mobile App        | View assigned tasks, upload completion images |
| **Authority** | Web Dashboard | Review reports, assign priorities, track analytics |

---

## 🔍 Features

### For Users:
- Upload road damage with images and location
- View status of submitted reports
- Track repair history

### For Workers:
- View assigned repair tasks
- Upload evidence of completed work

### For Authorities:
- AI-driven prioritization based on severity
- Historical analytics & trends

---

## AI Model Details

- **Model 1:** CNN for road classification
- **Model 2:** DETR (DEtection TRansformer) for bounding box regression and segmentation
- **Inference Pipeline:** 
  - Classify Image (road or not road)
  - Assess severity from bounding boxes (Low, Medium, High)
  - Assign repair priority score

---

## Mobile App

- Built with **React Native (Expo SDK 53)**
- Firebase Authentication
- Tab navigation via `expo-router`
- Libraries: `lucide-react-native`, `@react-native-async-storage/async-storage`

---

## Web Platform

- Developed with **React.js**
- Backend: **Node.js + Express.js**
- Database: **MongoDB**
- REST API with **JWT authentication**

---

## Dashboard Features

- Real-time damage tracking
- Task progress and worker performance
- Sorting reports based on priority and severity
- Notification system for urgent cases

---

## Tech Stack

| Layer         | Technology |
|---------------|------------|
| Frontend (App)| React Native (Expo) |
| Frontend (Web)| React.js |
| Backend       | Node.js, Express.js |
| Database      | MongoDB |
| ML Models     | CNN, DETR (PyTorch) |
| Auth          | Firebase (App), JWT (Web) |

---

## 🧪 Project Workflow

1. User/Worker captures image → uploads via app
2. Metadata auto-attached (location, timestamp)
3. Backend API handles:
    - Image preprocessing
    - ML model inference
    - Severity scoring and database update
4. Authorities view new reports → assign tasks
5. Workers complete tasks and upload results
6. User gets notified once resolved

---

## 📁 Folder Structure

```
safestreet/
├── App_Dev/            # React Native frontend
├── Web_Dev/         # React.js frontend for authorities
├── server/           # Node.js + Express backend
├── main/             # CNN + DETR models and preprocessing         
├── README.md              # This file
```
---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📫 Contact

For queries or collaboration:

- ✉️ Email: ozairgdsc@gmail.com
- 🔗 LinkedIn: https://www.linkedin.com/in/md-ozair-0a0241342/
- 💻 GitHub: https://github.com/ozair-kmit

---

> Empowering smarter streets with the power of AI — one pothole at a time!