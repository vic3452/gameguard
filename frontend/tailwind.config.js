/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void:    { DEFAULT: '#080812', 50: '#0d0d1f', 100: '#10101e' },
        plasma:  { DEFAULT: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
        neon:    { green: '#00ff88', cyan: '#00e5ff', pink: '#ff0080', yellow: '#ffd700' },
        threat:  { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' },
      },
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        body:    ['"Share Tech Mono"', 'monospace'],
        ui:      ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow:    '0 0 20px rgba(124,58,237,0.4)',
        'glow-green':  '0 0 20px rgba(0,255,136,0.3)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.4)',
        'glow-yellow': '0 0 20px rgba(255,215,0,0.3)',
      },
      animation: {
        pulse2: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
}
