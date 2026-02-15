![MyDiecast](/assets/app_icon.png)
# MyDiecast

MyDiecast is a lightweight React Native application designed for diecast car enthusiasts. It helps you manage your collection with ease, featuring intelligent entry, powerful search, and robust data portability.

---

### 🔍 Smart Search
MyDiecast goes beyond simple text search with AI-powered discovery:
- **Fuzzy Search**: Find cars by partial brand or model names.
- **Scan Box Art**: Uses on-device OCR to extract info from original packaging, with a new **editable verification dialog** for manual corrections.
- **Visual Match (AI)**: Take a photo of any car to find it in your collection. Uses a private, on-device TensorFlow Lite model.

---

## ✨ Features

- **Smart Collection Entry**: Use built-in OCR (Text Recognition) to scan diecast box art and automatically pre-fill car details like brand and model.
- **Fuzzy Search & Image Preview**: Find any car in your collection instantly with fuzzy search. Tap any thumbnail for a high-resolution, pinch-and-zoom full-screen preview.
- **Modern UI & Dark Mode**: A sleek interface built with Material Design 3, including a native-feeling dark mode and intuitive navigation.
- **Data Portability**: Full support for JSON import and export, allowing you to move your collection between devices easily.
- **Device-First Privacy**: Your data stays on your device. No cloud required.

---

## 🛠️ Developer Guide

### Prerequisites
- Node.js >= 22.11.0
- Android SDK 33
- **AI Model**: Ensure `assets/mobilenet_v2.tflite` is present for visual search.

### Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start Metro: `npm start`
4. Run on Android: `npx react-native run-android`

### AI & Data
- **Model**: MobileNetV2 (14MB TFLite)
- **Vector Search**: SQLite with JS-based Cosine Similarity
- **OCR**: Google ML Kit (on-device)

---

## 🔒 Data Safety & Security
Your collection is valuable, and so is your privacy. MyDiecast follows these core security principles:

1.  **Local Storage**: All your car data and preferences are stored locally on your device using encrypted-at-rest potential (depending on device settings). No data is ever sent to a central server.
2.  **User-Driven Portability**: The only time your data leaves the device is when **you** explicitly choose to "Export" it.
3.  **No Tracking**: The app does not include any third-party analytics or tracking scripts.
4.  **Data Persistence**: Your collection is saved in a persistent database (`AsyncStorage`). To ensure long-term safety, we recommend using the **Export Collection** feature periodically to save a backup JSON file to your personal cloud (Drive, iCloud, etc.).

---

## 🚀 Building & Running (Developers)

If you want to build the app from source or contribute, follow these steps:

### Prerequisites

- **Node.js**: v18 or v20+ (LTS recommended)
- **React Native Environment**: Follow the [official CLI setup guide](https://reactnative.dev/docs/environment-setup).
- **Android SDK**: SDK 33+ and `ANDROID_HOME` environment variable configured.
- **iOS (macOS only)**: Xcode 14+ and CocoaPods.

### Installation

```bash
git clone https://github.com/yourusername/mydiecast2.git
cd mydiecast2
npm install
```

### 🤖 Android
1. Connect a device or start an emulator.
2. Run `npm run android`.

### 🍎 iOS
1. `cd ios && pod install && cd ..`
2. Run `npm run ios`.

---

## 📱 User Guide

- **Adding a Car**: Tap the **+ FAB** on the home screen. You can either type details manually or use the camera icon to scan a box.
- **Searching**: Use the magnifying glass to search by brand, model, or your own notes.
- **Managing Data**: Open the side menu to Access **Share**, **Import**, **Export**, and **Settings**.
- **Zooming**: Tap any picture of a car to see it full-screen. Use two fingers to pinch and zoom for close-up details.

---

## 📝 License

This project is licensed under the MIT License.
