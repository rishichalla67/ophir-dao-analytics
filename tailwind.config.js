/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    minWidth: {
      "75%": "75%",
      "90%": "90%",
      "95%": "95%",
    },
    minHeight: {
      "98vh": "98vh",
      "90%": "90%",
    },
    extend: {
      animation: {
        spin: "spin 1s linear infinite",
      },
      animation: {
        bounce: "bounce 1s ease-in-out infinite",
        "bounce-dot": "bounce 1s ease-in-out infinite",
      },
      "example-container": {
        "& > div": {
          bg: "white",
          "border-radius": "30px",
          width: "150px",
          height: "150px",
          position: "absolute",
          top: "calc(50% - 150px / 2)",
          left: "calc(50% - 150px / 2)",
        },
        "& .drag-area": {
          opacity: ".2",
          background: "white",
          position: "absolute",
          width: "300px",
          height: "300px",
          "border-radius": "30px",
          top: "calc(50% - 150px)",
          left: "calc(50% - 150px)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
