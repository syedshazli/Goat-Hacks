/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wpiRed: '#AC2B37',
        wpiGray: '#A9B0B7',
        wpiBlack: '#000000'
      },
    },
  },
  plugins: [],
}