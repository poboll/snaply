/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'win-gray': '#c0c0c0',
        'win-gray-light': '#dfdfdf',
        'win-gray-dark': '#808080',
        'win-blue': '#000080',
        'win-text': '#000000',
        'win-text-disabled': '#808080',
      },
      fontFamily: {
        sans: ['"MS Sans Serif"', '"Tahoma"', 'sans-serif'],
      },
      boxShadow: {
        'win-outset': 'inset 1px 1px #dfdfdf, inset -1px -1px #808080, 1px 1px 0px #000000, -1px -1px 0px #ffffff, 2px 2px 0px #000000', 
        'win-inset': 'inset 1px 1px #808080, inset -1px -1px #dfdfdf, 1px 1px 0px #ffffff, -1px -1px 0px #000000',
        'win-button': 'inset 1px 1px #ffffff, inset -1px -1px #808080, 1px 1px #000000',
        'win-button-pressed': 'inset 1px 1px #000000, inset -1px -1px #ffffff',
      }
    },
  },
  plugins: [],
}
