/** @type {import('tailwindcss').Config} */
import TailwindTypography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin.js';

const disabledCss = {
	pre: false,
	'pre code': false
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
					accent: '#F57D00',
				},
				fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
				display: ['HF Bigcuat', 'Impact', 'Arial Black', 'sans-serif'],
			},
			typography: {
				DEFAULT: { css: disabledCss },
				sm: { css: disabledCss },
				lg: { css: disabledCss },
				xl: { css: disabledCss },
				'2xl': { css: disabledCss },
			},
		},
	},
	plugins: [
		TailwindTypography,
		plugin(function ({addVariant}) {
			addVariant('prose-inline-code', '&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))');
		})
	],
}
