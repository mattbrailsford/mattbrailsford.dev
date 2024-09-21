/** @type {import('tailwindcss').Config} */
import TailwindTypography from '@tailwindcss/typography';

const plugin = require('tailwindcss/plugin');

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Red Hat Display'],
				display: ['Source Sans 3'],
			}
		},
	},
	plugins: [
		TailwindTypography,
		plugin(function ({addVariant}) {
			addVariant('prose-inline-code', '&.prose :where(:not(pre)>code):not(:where([class~="not-prose"] *))');
		})
	],
}
