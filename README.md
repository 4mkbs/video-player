# Video Player Challenge

A React + TypeScript frontend challenge project implementing a custom video player with modern tooling and state management libraries.

## Project Overview

This is a **challenge starter** project for building a feature-rich video player component. The project is configured with multiple state management solutions to demonstrate different architectural patterns, including Redux, MobX, Nanostores, and Zustand.

## Features

- Custom video player component with standard controls
- Play/pause functionality
- Progress tracking and seeking
- Hover-based progress preview
- Responsive design with Tailwind CSS
- Built with modern React 19 and TypeScript

## Tech Stack

- **React** 19.1 - UI framework
- **TypeScript** 5.8 - Type safety
- **Vite** 7 - Build tool and dev server
- **Tailwind CSS** 4 - Styling
- **State Management Libraries** (choose one or experiment with multiple):
  - Redux + React-Redux
  - MobX + mobx-react-lite
  - Nanostores + @nanostores/react
  - Zustand
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm, npm, or yarn

### Installation

```bash
# Install dependencies
pnpm install
# or
npm install
```

### Development Server

```bash
# Start the dev server
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:4321`

### Build for Production

```bash
# Build the project
pnpm build
# or
npm run build
```

### Preview Production Build

```bash
# Preview the production build locally
pnpm preview
# or
npm run preview
```

## Project Structure

```
├── src/
│   ├── App.tsx           # Main video player component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   ├── vite-env.d.ts     # Vite type definitions
│   └── components/       # Reusable components
├── public/               # Static assets
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── index.html            # HTML template
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build locally

## Code Quality

```bash
# Run TypeScript type checking
pnpm tsc -b

# Run linting
pnpm lint
```

## Contributing

This is a challenge project for learning purposes. Feel free to experiment with:

- Different state management solutions
- Custom video player features
- UI enhancements with Tailwind CSS
- Component architecture improvements

## License

This project is part of the Fringecore challenge series.
