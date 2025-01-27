/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        custom: {
          primary: '#0694a2',
          'primary-lighter': '#16bdca',
          dark: '#1f2937',
        }
      },
      keyframes: {
        customSlideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        customSlideUp: {
          '0%': {
            opacity: '1',
            transform: 'translateY(0%)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-100%)',
          },
        }
      },
      animation: {
        customSlideDown: 'customSlideDown .5s'
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

