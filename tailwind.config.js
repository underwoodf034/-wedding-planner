/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wedding: {
          primary: '#333333',
          secondary: '#666666',
          accent: '#d4a574',
          light: '#f8f8f8',
          border: '#e5e5e5',
        }
      }
    },
  },
  plugins: [],
}
