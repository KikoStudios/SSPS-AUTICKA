import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: '#3E63DD',
            secondary: '#5c95ff',
            background: '#F2F3F7',
          },
        },
        dark: {
          colors: {
            primary: '#5c95ff',
            secondary: '#8CBE7F',
            background: '#0a0f1e',
          },
        },
      },
    }),
  ],
};
export default config;
