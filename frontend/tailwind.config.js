/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
        sans:    ['Outfit', 'sans-serif'],
      },
      colors: {
        accent: '#F5A623',
        surface: {
          base:    '#080808',
          DEFAULT: '#111111',
          raised:  '#191919',
          overlay: '#222222',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          hover:   'rgba(255,255,255,0.13)',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        fadeUp:  { from:{opacity:'0',transform:'translateY(20px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        shimmer: { '0%':{backgroundPosition:'-400px 0'}, '100%':{backgroundPosition:'400px 0'} },
      },
      animation: {
        'fade-up': 'fadeUp .45s cubic-bezier(.16,1,.3,1) forwards',
        shimmer:   'shimmer 1.5s infinite',
      },
      boxShadow: {
        'glow-amber': '0 0 32px rgba(245,166,35,0.22)',
        'glow-sm':    '0 0 16px rgba(245,166,35,0.15)',
      },
    },
  },
  plugins: [],
};
