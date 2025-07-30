import { json } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth';

export const POST = async ({ cookies }: { cookies: any }) => {
	try {
		const sessionToken = cookies.get('session');
		if (sessionToken) {
			await deleteSession(sessionToken);
		}

		cookies.delete('session', { path: '/' });
		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
