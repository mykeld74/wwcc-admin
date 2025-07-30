import { json } from '@sveltejs/kit';

export async function GET() {
	return json({
		googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
		databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
		nodeEnv: process.env.NODE_ENV || 'Not set'
	});
}
