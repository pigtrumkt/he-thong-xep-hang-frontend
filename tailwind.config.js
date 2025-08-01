module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      keyframes: {
        zoomIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        zoomOut: {
          "0%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
        },
      },
      animation: {
        "zoom-in": "zoomIn 0.2s ease-out forwards",
        "zoom-out": "zoomOut 0.2s ease-in forwards",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
