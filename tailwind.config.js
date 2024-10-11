/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", 
  "./src/**/*.{js,jsx,ts,tsx}",
    './views/**/*.html'],
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
