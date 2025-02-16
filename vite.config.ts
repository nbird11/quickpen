import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-core': ['firebase/compat/app'],
          'firebase-auth': ['firebase/compat/auth'],
          'firebase-firestore': ['firebase/compat/firestore'],
          'firebase-storage': ['firebase/compat/storage'],
          'firebase-analytics': ['firebase/compat/analytics'],
          'vendor': ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  }
})
