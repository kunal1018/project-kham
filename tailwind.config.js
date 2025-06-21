/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors matching your existing design system
        primary: {
          navy: '#1E293B',
          white: '#FFFFFF',
        },
        accent: {
          purple: '#A78BFA',
          'purple-dark': '#8B5CF6',
          green: '#34D399',
          'green-dark': '#10B981',
          blue: '#60A5FA',
          'blue-dark': '#3B82F6',
          coral: '#FF7F6B',
          'coral-dark': '#EF4444',
        },
        rank: {
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#E5E4E2',
          diamond: '#B9F2FF',
        }
      },
      fontFamily: {
        'display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0px 2px 6px rgba(0, 0, 0, 0.05)',
        'secondary': '0px 4px 12px rgba(0, 0, 0, 0.1)',
        'purple': '0px 4px 12px rgba(167, 139, 250, 0.3)',
        'green': '0px 4px 12px rgba(52, 211, 153, 0.3)',
        'blue': '0px 4px 12px rgba(96, 165, 250, 0.3)',
        'coral': '0px 4px 12px rgba(255, 127, 107, 0.3)',
        'gold': '0px 4px 12px rgba(255, 215, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
      }
    },
  },
  plugins: [],
}