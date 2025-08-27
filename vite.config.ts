import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],
	optimizeDeps: {
		exclude: ['@neondatabase/serverless', 'bcryptjs', 'better-auth', 'drizzle-orm', 'nodemailer']
	},
	ssr: {
		noExternal: ['@neondatabase/serverless']
	}
});
