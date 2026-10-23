// Suppress internal Emscripten / MediaPipe / TensorFlow Lite WASM informational messages
// that are emitted to stderr and mapped to console.error in browser environments
const isTfLiteMessage = (val: unknown): boolean => {
  if (typeof val === 'string') {
    return (
      val.includes('TensorFlow Lite') ||
      val.includes('XNNPACK delegate') ||
      val.includes('INFO: Created') ||
      val.includes('face_landmarker')
    );
  }
  if (val && typeof val === 'object') {
    const str = String((val as { message?: unknown }).message || (val as { reason?: unknown }).reason || '');
    return str.includes('TensorFlow Lite') || str.includes('XNNPACK delegate') || str.includes('INFO: Created');
  }
  return false;
};

const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.error = (...args: unknown[]) => {
  if (args.some(isTfLiteMessage)) return;
  originalError.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  if (args.some(isTfLiteMessage)) return;
  originalWarn.apply(console, args);
};

console.info = (...args: unknown[]) => {
  if (args.some(isTfLiteMessage)) return;
  originalInfo.apply(console, args);
};

window.addEventListener('error', (event) => {
  if (isTfLiteMessage(event.message) || isTfLiteMessage(event.error)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (isTfLiteMessage(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
