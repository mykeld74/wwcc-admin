import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';

export const GET = async ({ cookies }: { cookies: any }) => {
	try {
		// Check if user is authenticated and has admin permissions
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await validateSession(sessionToken);
		if (!user || user.role !== 'admin') {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		// Get all users
		const allUsers = await db.select().from(users).orderBy(users.createdAt);

		return json(allUsers);
	} catch (error) {
		console.error('Error fetching users:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
