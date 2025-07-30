import { json } from '@sveltejs/kit';
import { authenticateUser, createSession } from '$lib/server/auth';

export const POST = async ({ request, cookies }: { request: Request; cookies: any }) => {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const user = await authenticateUser(email, password);
		if (!user) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const sessionToken = await createSession(user.id);
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 30 * 24 * 60 * 60 // 30 days
		});

		return json({
			user: { id: user.id, email: user.email, name: user.name, isStaff: user.isStaff }
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
