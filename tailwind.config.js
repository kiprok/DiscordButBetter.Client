/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        mouse: { raw: '(pointer: fine)' },
        touch: { raw: '(pointer: coarse)' },
      },
    },
  },
  plugins: [],
};
