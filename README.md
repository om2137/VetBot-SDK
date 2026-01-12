# VetBot 🐾  
### A Gemini-powered Veterinary Assistance & Appointment Booking Chatbot

VetBot is a **website-integrable chatbot platform** that provides **general veterinary guidance** and supports **appointment booking** through a conversational interface.  

---

## ✨ Key Features

- Embeddable chatbot using a **single script tag**
- AI-powered veterinary Q&A using **Google Gemini**
- Deterministic, guided **appointment booking flow**
- Persistent chat sessions with MongoDB
- Expandable/collapsible floating chat widget

---

## 🧱 Architecture Overview

The system is divided into **four loosely coupled components**, each independently deployable.
```
┌──────────────────┐
│ Host Website     │
│ (Any Platform)   │
└────────┬─────────┘
         │ <script>
         ▼
┌──────────────────┐
│ Chatbot SDK      │
│ (chatbot.js)     │
│ - Session mgmt   │
│ - Context        │
│ - Iframe inject  │
└────────┬─────────┘
         │ postMessage
         ▼
┌──────────────────┐
│ React Chat UI    │
│ - Chat UX        │
│ - Booking UI     │
│ - State display  │
└────────┬─────────┘
         │ REST APIs
         ▼
┌───────────────────────────┐
│ Backend (Node + Express)  │
│ - Sessions & Messages     │
│ - Booking state machine   │
│ - Gemini orchestration    │
└────────┬──────────────────┘
         │
         ▼
┌──────────────────┐
│ Gemini AI API    │
│ MongoDB Atlas    │
└──────────────────┘
```

---

## 🧠 Design Principles & Decisions

### Separation of Concerns
- **SDK**: Embedding, session creation, context passing
- **UI**: Rendering only (stateless)
- **Backend**: Business logic, booking flow, AI integration
- **AI**: Language understanding only (not business logic)

### Key Decisions
- Used **iframe isolation** to prevent CSS/JS conflicts on host websites
- Booking flow is **rule-based**, not AI-driven
- AI responses are **strictly parsed as structured JSON**

### Trade-offs
- Slightly increased system complexity due to multiple components
- Chosen to ensure reliability, predictability, and scalability

---

## 🤖 AI Usage

- Powered by **Google Gemini API**
- AI is used for:
  - Understanding user intent
  - Generating natural language responses
- AI is **not** responsible for:
  - Booking logic
  - Data persistence

Structured prompting ensures predictable outputs:
```json
{
  "intent": "GENERAL_VET_QUESTION | BOOK_APPOINTMENT",
  "reply": "response text"
}
```

## 🗓 Appointment Booking Flow

The appointment booking process follows a **deterministic, step-by-step conversational flow** to ensure clarity and prevent incomplete bookings.

### Flow Steps

```text
Pet Information
      ↓
Phone Number
      ↓
Appointment Date
      ↓
Time Slot Selection
      ↓
Confirmation
```


- Booking state is persisted in MongoDB
- Appointments are linked using the **session ID**
- Users are guided step-by-step using dynamic UI components such as:
  - Date picker
  - Slot selection
  - Confirmation prompt

---

## 🔌 SDK Integration

VetBot can be embedded into any website using a single script tag.

```html
<script src="https://vet-bot-sdk.vercel.app/chatbot.js"></script>

<script>
  window.VetChatbotConfig = {
    userId: "user_123",
    userName: "John Doe",
    petName: "Buddy",
    source: "marketing-website"
  };
</script>
```


