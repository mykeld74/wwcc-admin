import { json } from '@sveltejs/kit';

export async function GET() {
	return json({
		clientId: process.env.GOOGLE_CLIENT_ID || null
	});
}
