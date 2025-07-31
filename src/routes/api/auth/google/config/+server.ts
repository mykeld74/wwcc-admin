import { json } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID } from '$env/static/private';

export async function GET() {
	return json({
		clientId: GOOGLE_CLIENT_ID || null
	});
}
