import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const GET = async ({ cookies }: { cookies: any }) => {
	try {
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Not authenticated' }, { status: 401 });
		}

		const user = await validateSession(sessionToken);
		if (!user) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				isStaff: user.isStaff,
				role: user.role
			}
		});
	} catch (error) {
		console.error('Auth check error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
