import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { eq } from 'drizzle-orm';

export const PATCH = async ({
	params,
	request,
	cookies
}: {
	params: { id: string };
	request: Request;
	cookies: any;
}) => {
	try {
		// Check if user is authenticated and has admin permissions
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const currentUser = await validateSession(sessionToken);
		if (!currentUser || currentUser.role !== 'admin') {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		const userId = parseInt(params.id);
		if (isNaN(userId)) {
			return json({ error: 'Invalid user ID' }, { status: 400 });
		}

		// Prevent admin from changing their own role
		if (userId === currentUser.id) {
			return json({ error: 'Cannot modify your own role' }, { status: 400 });
		}

		const body = await request.json();
		const { role } = body;

		if (!role || !['prayer_partner', 'staff', 'admin'].includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Update user role
		const [updatedUser] = await db
			.update(users)
			.set({
				role,
				updatedAt: new Date()
			})
			.where(eq(users.id, userId))
			.returning();

		if (!updatedUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json(updatedUser);
	} catch (error) {
		console.error('Error updating user:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE = async ({ params, cookies }: { params: { id: string }; cookies: any }) => {
	try {
		// Check if user is authenticated and has admin permissions
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const currentUser = await validateSession(sessionToken);
		if (!currentUser || currentUser.role !== 'admin') {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		const userId = parseInt(params.id);
		if (isNaN(userId)) {
			return json({ error: 'Invalid user ID' }, { status: 400 });
		}

		// Prevent admin from deleting themselves
		if (userId === currentUser.id) {
			return json({ error: 'Cannot delete your own account' }, { status: 400 });
		}

		// Delete user
		const result = await db.delete(users).where(eq(users.id, userId));

		if (result.rowCount === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting user:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
