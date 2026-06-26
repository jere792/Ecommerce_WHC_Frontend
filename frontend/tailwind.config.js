/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Asegura que Tailwind escanee tus archivos correctamente
    ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    },
   	extend: {
   		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
   colors: {
   			background: 'var(--background)',
   			foreground: 'var(--foreground)',
   			card: {
   				DEFAULT: 'var(--card)',
   				foreground: 'var(--card-foreground)'
   			},
   			popover: {
   				DEFAULT: 'var(--popover)',
   				foreground: 'var(--popover-foreground)'
   			},
    			primary: {
    				DEFAULT: 'var(--primary)',
    				foreground: 'var(--primary-foreground)',
    				'50': 'var(--primary-50)',
    				'100': 'var(--primary-100)',
    				'200': 'var(--primary-200)',
    				'300': 'var(--primary-300)',
    				'400': 'var(--primary-400)',
    				'500': 'var(--primary-500)',
    				'600': 'var(--primary-600)',
    				'700': 'var(--primary-700)',
    				'800': 'var(--primary-800)',
    				'900': 'var(--primary-900)',
    			},
    			secondary: {
    				DEFAULT: 'var(--secondary)',
    				foreground: 'var(--secondary-foreground)',
    				'50': 'var(--secondary-50)',
    				'100': 'var(--secondary-100)',
    				'200': 'var(--secondary-200)',
    				'300': 'var(--secondary-300)',
    				'400': 'var(--secondary-400)',
    				'500': 'var(--secondary-500)',
    				'600': 'var(--secondary-600)',
    				'700': 'var(--secondary-700)',
    				'800': 'var(--secondary-800)',
    				'900': 'var(--secondary-900)',
    			},
   			muted: {
   				DEFAULT: 'var(--muted)',
   				foreground: 'var(--muted-foreground)'
   			},
   			accent: {
   				DEFAULT: 'var(--accent)',
   				foreground: 'var(--accent-foreground)'
   			},
   			destructive: {
   				DEFAULT: 'var(--destructive)',
   				foreground: 'var(--destructive-foreground)'
   			},
   			border: 'var(--border)',
   			input: 'var(--input)',
   			ring: 'var(--ring)',
   			chart: {
   				'1': 'var(--chart-1)',
   				'2': 'var(--chart-2)',
   				'3': 'var(--chart-3)',
   				'4': 'var(--chart-4)',
   				'5': 'var(--chart-5)'
   			}
   		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};


