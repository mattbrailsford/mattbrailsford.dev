/** @type {import('tailwindcss').Config} */
import TailwindTypography from '@tailwindcss/typography';

const plugin = require('tailwindcss/plugin');

const disabledCss = {
	pre: false,
	'pre code': false
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Red Hat Display'],
				display: ['Source Sans 3'],
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
