/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        'roboto-mono': ['Roboto Mono', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
        'pixelify': ['"Pixelify Sans"', 'sans-serif'],
        'tiny': ['Tiny5', 'cursive'], // make sure Tiny5 is loaded via <link> in <head>
      },
      colors: {
        'custom-brown': '#EF835F', // Adding your custom color
      },
    },
  },
  plugins: [],
};
