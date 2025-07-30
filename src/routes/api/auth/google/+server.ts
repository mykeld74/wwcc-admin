import { json } from '@sveltejs/kit';
import { findOrCreateGoogleUser, verifyGoogleToken, createSession } from '$lib/server/auth';

export async function POST({ request, cookies }) {
	try {
		const { idToken } = await request.json();

		if (!idToken) {
			return json({ error: 'No ID token provided' }, { status: 400 });
		}

		// Verify the Google ID token
		const googleUser = await verifyGoogleToken(idToken);
		if (!googleUser) {
			return json({ error: 'Invalid Google token' }, { status: 401 });
		}

		// Find or create user
		const user = await findOrCreateGoogleUser(googleUser);

		// Create session
		const sessionToken = await createSession(user.id);

		// Set session cookie
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days
		});

		return json({ success: true, user });
	} catch (error) {
		console.error('Google OAuth error:', error);
		return json({ error: 'Authentication failed' }, { status: 500 });
	}
}
