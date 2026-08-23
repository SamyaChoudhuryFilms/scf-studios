/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#08090D',
        'bg-secondary': '#101218',
        'card-bg': '#151821',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A8ACB8',
        'text-muted': '#6F7480',
        'brand-accent': '#6366F1', // Premium Indigo accent
        'brand-accent-hover': '#4F46E5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
