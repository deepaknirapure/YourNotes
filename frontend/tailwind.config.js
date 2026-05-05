module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'yn-bg':      '#151313',
        'yn-surface': '#1e1b1b',
        'yn-border':  '#2a2525',
        'yn-primary': '#ff5734',
        'yn-purple':  '#be94f5',
        'yn-yellow':  '#fcc42d',
        'yn-light':   '#f7f7f5',
        'yn-muted':   '#8a7f7f',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
