export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5',
          600: '#4338ca',
        },
      },
      boxShadow: {
        soft: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
