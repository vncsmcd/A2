/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.ejs", 
    "./src/**/*.{js,jsx,ts,tsx}",
    './views/**/*.ejs'
],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["coffee"], 
  },
}