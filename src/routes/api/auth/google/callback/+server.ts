import { redirect } from '@sveltejs/kit';
import { findOrCreateGoogleUser, createSession } from '$lib/server/auth';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export async function GET({
	url,
	cookies
}: {
	url: URL;
	cookies: {
		get: (key: string) => string | undefined;
		set: (
			key: string,
			value: string,
			options?: {
				path?: string;
				httpOnly?: boolean;
				secure?: boolean;
				sameSite?: string;
				maxAge?: number;
			}
		) => void;
	};
}) {
	try {
		console.log('Google OAuth callback started');
		const code = url.searchParams.get('code');
		const error = url.searchParams.get('error');

		console.log('Code:', code ? 'Present' : 'Missing');
		console.log('Error:', error);

		if (error) {
			console.log('Google OAuth error:', error);
			throw redirect(302, '/login?error=Google authentication failed');
		}

		if (!code) {
			console.log('No authorization code received');
			throw redirect(302, '/login?error=No authorization code received');
		}

		console.log('Exchanging code for token...');
		// Exchange code for access token
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: `${url.origin}/api/auth/google/callback`
			})
		});

		console.log('Token response status:', tokenResponse.status);
		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.log('Token exchange error:', errorText);
			throw redirect(302, '/login?error=Failed to exchange authorization code');
		}

		const tokenData = await tokenResponse.json();
		console.log('Token exchange successful');

		// Get user info from Google
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`
			}
		});

		if (!userInfoResponse.ok) {
			throw redirect(302, '/login?error=Failed to get user information');
		}

		const userInfo = await userInfoResponse.json();
		console.log('User info received:', {
			id: userInfo.id,
			email: userInfo.email,
			name: userInfo.name
		});

		// Find or create user
		console.log('Finding or creating user...');
		const user = await findOrCreateGoogleUser({
			id: userInfo.id,
			email: userInfo.email,
			name: userInfo.name,
			picture: userInfo.picture
		});
		console.log('User found/created:', user.id);

		// Create session
		console.log('Creating session...');
		const sessionToken = await createSession(user.id);
		console.log('Session created');

		// Set session cookie
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days
		});

		// Return a response that sets the cookie and redirects
		return new Response(
			`<!DOCTYPE html>
<html>
<head>
	<title>Redirecting...</title>
</head>
<body>
	<script>
		// Set the session cookie
		document.cookie = 'session=${sessionToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax';
		// Redirect to home page
		window.location.href = '/?message=Successfully signed in with Google';
	</script>
	<p>Redirecting...</p>
</body>
</html>`,
			{
				status: 200,
				headers: {
					'Content-Type': 'text/html'
				}
			}
		);
	} catch (error) {
		console.error('Google OAuth callback error:', error);
		// If it's already a redirect response, re-throw it
		if (error instanceof Response) {
			throw error;
		}
		// Only redirect to login with error for actual errors
		throw redirect(302, '/login?error=Authentication failed');
	}
}
