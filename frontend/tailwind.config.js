/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#CAB2A4',
        secondary: '#846047',
        'primary-dark': '#b89d8e',
        'secondary-dark': '#6b4d37',
      },
    },
  },
  plugins: [],
}
