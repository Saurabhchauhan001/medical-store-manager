/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f172a',    // slate-900
        surface: '#1e293b',       // slate-800
        surfaceHover: '#334155',  // slate-700
        primary: '#3b82f6',       // blue-500
        primaryHover: '#2563eb',  // blue-600
        accent: '#8b5cf6',        // violet-500
        danger: '#ef4444',        // red-500
        warning: '#f59e0b',       // amber-500
        success: '#10b981',       // emerald-500
      }
    },
  },
  plugins: [],
}
