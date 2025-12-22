# lecturePlayer

[![CodeQL](https://github.com/lectureStudio/lecturePlayer/actions/workflows/codeql.yml/badge.svg?branch=main&event=push)](https://github.com/lectureStudio/lecturePlayer/actions/workflows/codeql.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A browser-based streaming player for rendering real-time presentations streamed with [lectureStudio](https://github.com/lectureStudio). Built with modern web technologies, it provides an interactive lecture experience with live annotations, video conferencing, and collaborative features.

## ✨ Features

- **Real-time Slide Streaming** — View presentations with live annotations as they happen
- **Interactive Annotations** — Pen, highlighter, shapes, and text support
- **Video Conferencing** — Multi-party video/audio via WebRTC (Janus Gateway)
- **Live Chat** — Real-time messaging during lectures
- **Quiz Integration** — Interactive quizzes and polls
- **PDF Rendering** — High-quality slide rendering with PDF.js
- **Multi-language** — English and German localization
- **Theme Support** — Light, dark, and system-adaptive themes
- **Responsive Design** — Works on desktop and tablet devices

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| UI Framework | [Lit](https://lit.dev/) 3.x (Web Components) |
| State Management | [MobX](https://mobx.js.org/) 6.x |
| Real-time Communication | [Janus Gateway](https://janus.conf.meetecho.com/) (WebRTC) |
| Messaging | [STOMP](https://stomp.github.io/) over WebSocket |
| PDF Rendering | [PDF.js](https://mozilla.github.io/pdf.js/) |
| UI Components | [Shoelace](https://shoelace.style/) |
| Internationalization | [i18next](https://www.i18next.com/) |
| Build Tools | Webpack, esbuild, Babel, TypeScript |

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- npm 9.x or higher

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/lectureStudio/lecturePlayer.git
cd lecturePlayer

# Install dependencies
npm install
```

### Development

```bash
# Start development build with watch mode
npm run watch

# Or use webpack watch mode
npm run webpack:watch
```

### Production Build

```bash
# Create optimized production build
npm run webpack:prod

# Or development build (unminified)
npm run webpack:dev
```

Build output is written to the `build/` directory.

### Testing & Linting

```bash
# Run tests with coverage
npm run test

# Run tests in watch mode
npm run test:watch

# Run ESLint
npm run lint
```

## 📁 Project Structure

```
src/
├── action/           # Action system for recording/playback
│   └── parser/       # Binary action parsers
├── component/        # Lit Web Components
│   ├── controls/     # Player control buttons
│   ├── player/       # Main player component
│   ├── slide-view/   # Slide rendering component
│   └── ...
├── event/            # Custom event type definitions
├── geometry/         # Geometric primitives (Point, Rectangle, etc.)
├── model/            # Data models
│   └── shape/        # Annotation shape types
├── paint/            # Drawing primitives (Brush, Color, Font)
├── render/           # Canvas rendering engine
├── service/          # External service integrations
│   ├── janus.service.ts      # WebRTC via Janus
│   ├── chat.service.ts       # Chat messaging
│   └── playback.service.ts   # Action playback
├── store/            # MobX state stores
├── tool/             # Interactive annotation tools
├── transport/        # REST API clients
├── locales/          # i18n translation files
│   ├── de/           # German
│   └── en/           # English
└── utils/            # Utility functions
```

## 🔧 Configuration

### PDF Worker

The PDF.js worker must be available at `/js/pdf.worker.js`. Ensure your server or build process copies the worker file to this location.

### Backend Requirements

The player expects the following backend endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/v1/course/state/{courseId}` | Course state and documents |
| `/ws-state` | WebSocket endpoint for STOMP |
| `/janus` | Janus Gateway WebRTC signaling |

## 🌐 Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Speaker selection requires `media.setsinkid.enabled` flag |
| Edge | 90+ | Full support |
| Safari | 15+ | Limited speaker selection, iOS volume control via hardware |

### Required Browser Features

- WebRTC (RTCPeerConnection)
- WebSocket
- Canvas 2D
- Web Audio API
- ES2020+ JavaScript

## 🎨 Theming

The player supports three color schemes:

- **Light** — Bright theme for well-lit environments
- **Dark** — Dark theme for reduced eye strain
- **System** — Follows the operating system preference

Theme preference is persisted in `localStorage`.

## 📝 Usage

Embed the player in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="path/to/lecture-player.js"></script>
</head>
<body>
  <lecture-player 
    courseId="12345"
    isLive="true"
    isClassroom="false">
  </lecture-player>
</body>
</html>
```

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `courseId` | Number | The unique course/lecture identifier |
| `isLive` | Boolean | Whether the stream is currently live |
| `isClassroom` | Boolean | Classroom mode (features only, no streaming) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- TypeScript with strict mode enabled
- ESLint for code quality
- Lit for web components
- Follow existing patterns and conventions

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [lectureStudio](https://github.com/lectureStudio/lectureStudio) — Desktop application for creating and streaming lectures
- [Janus Gateway](https://github.com/meetecho/janus-gateway) — WebRTC server used for video conferencing
