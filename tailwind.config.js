/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',   // Update to look for .ejs files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['cupcake'],
  },
}
