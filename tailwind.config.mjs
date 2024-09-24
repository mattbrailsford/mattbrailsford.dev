/** @type {import('tailwindcss').Config} */
import TailwindTypography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme'

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
				fontFamily: {
					sans: ['Red Hat Display', ...defaultTheme.fontFamily.sans],
				},
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
