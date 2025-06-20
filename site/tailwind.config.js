const { heroui } = require('@heroui/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['Gilroy', 'sans-serif'],
        ramillas: ['TTRamillasTrl', 'serif'],
      },
      backgroundImage: {
        'custom-gradient':
          'radial-gradient(100% 2149.63% at 0% 0%, #005FCC 0%, #014594 100%)',
      },
      boxShadow: {
        'custom-shadow': '0px 4px 20px 0px #02276F40',
        'custom-combined':
          '0px 0.76px 3.15px 0px #00000001, ' +
          '0px 3.34px 6.52px 0px #00000002, ' +
          '0px 8.2px 13px 0px #00000003, ' +
          '0px 15.79px 25.48px 0px #00000003, ' +
          '0px 26.57px 46.85px 0px #00000004, ' +
          '0px 41px 80px 0px #00000005',
        'border-shadow': '#rgba(17,17,26,_0.1) 0px 0px 16px',
      },
      colors: {
        blue_850: '#005FCC',
        text_gray: '#3D3D3D',
        bg_gray: '#EEF1F4',
        chinese_oragne: '#ED6943',
        light_orange: 'rgba(237, 105, 67, 0.07)',
        border_gray: '#f7f7f7',
        chinese_orange: '#ED6943',
        platinum: '#E5E5E5',
        liberty: '#4353A4',
        dark_black: '#2D2C31',
        velvet_grey: '#A8A6B0',
        pale_red: '#FFD2D2',
      },
      textColor: {
        chinese_orange: '#ED6943',
        spanish_gray: '#969495',
        chinese_oragne: '#ED6943',
        navy_blue: '#242052',
        liberty: '#4353A4',
      },
      maxWidth: {
        container_max_width: '545px',
      },
      borderRadius: {
        24: '24px',
      },
      fontWeight: {
        light: 300,
        medium: 500,
        bold: 600,
        black: 900,
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            foreground: '#5E5E61',
            background: '#FFFFFF',
            cardBg: '#FDFDFD',
            cardBorder: '#F6F6F6',
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#2D2C31",
              // for muted text
              "100": "#A9A6B2",
            },

          }
        }
      }
    })
  ],
};
