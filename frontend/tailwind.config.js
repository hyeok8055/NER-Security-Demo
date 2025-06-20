/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'chatgpt-gray': '#f7f7f8',
        'chatgpt-dark': '#2d2d2d',
        'chatgpt-border': '#e5e5e5',
        'grammarly-green': '#15c39a',
        'grammarly-blue': '#4285f4',
        'grammarly-red': '#ff6b6b',
        'grammarly-orange': '#ffa500',
        'sidebar-bg': '#ffffff',
        'danger-red': '#dc2626',
        'warning-yellow': '#f59e0b',
        'info-blue': '#3b82f6'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'chatgpt': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'grammarly': '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [],
}