import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createUser } from '$lib/server/auth';
import { db } from '$lib/server/db/index';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, name, role } = await request.json();

		// Validate required fields
		if (!email || !password || !name) {
			return json({ error: 'Email, password, and name are required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate password length
		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
		}

		// Validate role
		const validRoles = ['prayer_partner', 'staff', 'admin'];
		if (!validRoles.includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Check if user already exists
		const [existingUser] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email));

		if (existingUser) {
			return json({ error: 'User with this email already exists' }, { status: 409 });
		}

		// Create user
		const user = await createUser(email, name, password, role);

		return json({
			message: 'User created successfully',
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				isStaff: user.isStaff
			}
		});
	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
