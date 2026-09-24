# AwaazLink
AwaazLink — An accessible, voice-first smart home control layer designed to help elderly, visually-impaired, and users with non-standard speech control existing smart plugs and switches through natural voice commands.
# AwaazLink 🎙️🏠

## Voice-First Accessibility Layer for Smart Home Automation

AwaazLink is an accessible voice-first control layer designed to make existing smart-home automation easier to use for elderly users, visually-impaired users, and users with speech impairments or strong regional accents.

Instead of replacing existing smart plugs and switches, AwaazLink works as an intelligent layer between the user and the existing home-automation system.

> **Speak naturally. Control confidently.**

---

## 🚨 Problem Statement

A smart-home application may work perfectly for its designer but become difficult to use for someone who simply wants to turn off a light.

Traditional smart-home applications often require users to:

- Navigate mobile applications
- Find the correct device
- Interact with small buttons
- Understand visual feedback

Voice assistants address part of this problem, but users with strong regional accents, speech impairments, unusual pronunciation, mixed-language commands, or different speaking patterns may still experience unreliable recognition.

For a user who simply wants to say:

> **"Bedroom wali light band kar."**

a recognition failure can make the entire smart-home system difficult to use.

### The Goal

AwaazLink aims to bridge the gap between **natural human speech and existing smart-home automation** without requiring users to replace their existing hardware.

---

## 💡 Our Solution

AwaazLink introduces a **voice-first accessibility layer** between natural human speech and existing smart-home devices.

### Core Flow

```text
User Speech
     ↓
Speech Recognition
     ↓
Speech Normalization
     ↓
Intent Detection
     ↓
Confidence + Context Check
     ↓
 ┌───────────────┐
 │               │
High Confidence  Low Confidence
 │               │
 ↓               ↓
Execute        Clarify
 │               │
 └───────┬───────┘
         ↓
Existing Smart Device
         ↓
Voice Feedback
✨ Key Features
🎙️ Natural Voice Commands

Users can speak naturally instead of memorizing rigid or fixed commands.

🧠 Robust Speech Understanding

Designed to handle variations in:

Pronunciation
Phrasing
Accents
Speaking patterns
Mixed-language commands
🎯 Intent Detection

The system identifies the required:

Device + Action + Location

Example:

"Hall ka fan off kar"

Device  → Hall Fan
Action  → OFF
🛡️ Confidence-Aware Control

AwaazLink follows a simple safety principle:

High confidence → Execute
Low confidence  → Clarify
🔌 Existing Hardware Compatibility

AwaazLink is designed as a control layer that works with existing affordable smart plugs and switches instead of requiring a complete hardware replacement.

🔊 Voice Feedback
## 🛠️ Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| 🎙️ Speech Recognition | Whisper / faster-whisper | Converts natural speech into text |
| 🧠 Speech Processing | Python | Audio processing and speech pipeline |
| 🎯 Intent Detection | Python | Extracts device, action, and location |
| 🔤 Fuzzy Matching | RapidFuzz | Handles variations in words and pronunciation |
| ⚙️ Backend | FastAPI | Provides APIs and connects system components |
| 🔌 Device Communication | MQTT / HTTP | Communicates with smart plugs and switches |
| 💻 Frontend | React | User interface and system interaction |
| 🗄️ Database | SQLite | Stores device and automation information |
| 🔊 Voice Feedback | Text-to-Speech (TTS) | Provides spoken confirmation to users |
| 🔧 Version Control | Git & GitHub | Source-code management and collaboration |

### Architecture Stack

```text
┌─────────────────────────────────────┐
│              USER                   │
│         Natural Voice Input         │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│       Speech Recognition Layer      │
│        Whisper / faster-whisper     │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│       Speech Processing Layer       │
│       Python + Normalization        │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          Intent Engine              │
│    Device + Action + Location       │
│       RapidFuzz + Context           │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│       Confidence & Safety Layer     │
│   High Confidence → Execute        │
│   Low Confidence  → Clarify        │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          FastAPI Backend            │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│       MQTT / HTTP Device Layer      │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│       Existing Smart Devices        │
│     Smart Plugs / Smart Switches    │
└──────────────────┬──────────────────┘
                   ↓
┌─────────────────────────────────────┐
│          Voice Feedback             │
│               TTS                   │
└─────────────────────────────────────┘
  
                     🔊 Feedback
