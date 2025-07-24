module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mainPrimary: '#2354E9',
        mainBackground: '#0D0F15',
        mainSurface: '#292C35',
        mainText: '#F3F4F6',
        mainError: '#EF4444',
        mainInputBg: '#0D0F15',
      },
    },
  },
  plugins: [],
}