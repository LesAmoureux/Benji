/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        benji: {
          cream:       '#F9F1E6',
          parchment:   '#F5F0E1',
          paper:       '#FFFBF5',
          sage:        '#A3C191',
          'sage-dark': '#7D9B6B',
          forest:      '#2C3E34',
          'forest-light': '#3D5A45',
          ink:         '#5C665E',
          brick:       '#B54A4A',
          moss:        '#3D5A45',
          vault:       '#0D1410',
          'vault-up':  '#1A2420',
          'vault-card':'#1E2A24',
          gold:        '#C9A227',
          'gold-light':'#D4AF37',
          jade:        '#5EEAD4',
          'jade-dim':  '#3B9B85',
          coral:       '#E07A5F',
          mist:        '#F4EFE6',
          'mist-dim':  '#B8C4B8',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 1px 3px 0 rgba(44, 62, 52, 0.08), 0 1px 2px -1px rgba(44, 62, 52, 0.06)',
        'warm-md': '0 4px 6px -1px rgba(44, 62, 52, 0.08), 0 2px 4px -2px rgba(44, 62, 52, 0.05)',
        'vault': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'vault-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
