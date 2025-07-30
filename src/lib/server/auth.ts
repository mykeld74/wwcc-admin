import { db } from './db/index';
import { users, sessions } from './db/schema';
import { eq, lt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface GoogleUserInfo {
	id: string;
	email: string;
	name: string;
	picture?: string;
}

export interface User {
	id: number;
	email: string;
	name: string;
	role: string;
	isStaff: boolean;
}

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export async function createUser(
	email: string,
	name: string,
	password: string,
	role: string = 'prayer_partner'
): Promise<User> {
	const passwordHash = await hashPassword(password);

	// Determine if user is staff based on role
	const isStaff = role === 'staff' || role === 'admin';

	const [user] = await db
		.insert(users)
		.values({
			email,
			name,
			passwordHash,
			role,
			isStaff
		})
		.returning({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isStaff: users.isStaff
		});

	return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
	const [user] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			passwordHash: users.passwordHash,
			isStaff: users.isStaff
		})
		.from(users)
		.where(eq(users.email, email));

	if (!user || !user.passwordHash) return null;

	const isValid = await verifyPassword(password, user.passwordHash);
	if (!isValid) return null;

	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		isStaff: user.isStaff
	};
}

export async function createSession(userId: number): Promise<string> {
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

	await db.insert(sessions).values({
		userId,
		token,
		expiresAt
	});

	return token;
}

export async function validateSession(token: string): Promise<User | null> {
	const [session] = await db
		.select({
			userId: sessions.userId,
			expiresAt: sessions.expiresAt
		})
		.from(sessions)
		.where(eq(sessions.token, token));

	if (!session || session.expiresAt < new Date()) {
		return null;
	}

	const [user] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isStaff: users.isStaff
		})
		.from(users)
		.where(eq(users.id, session.userId));

	return user || null;
}

export async function deleteSession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanupExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// Google OAuth functions
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
	try {
		// For now, we'll use a simple approach. In production, you should verify the token with Google
		// This is a placeholder - you'll need to implement proper Google token verification
		const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return {
			id: data.sub,
			email: data.email,
			name: data.name,
			picture: data.picture
		};
	} catch (error) {
		console.error('Error verifying Google token:', error);
		return null;
	}
}

export async function findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<User> {
	// First, try to find existing user by Google ID
	let [user] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isStaff: users.isStaff
		})
		.from(users)
		.where(eq(users.googleId, googleUser.id));

	if (user) {
		return user;
	}

	// If not found by Google ID, try to find by email
	[user] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isStaff: users.isStaff
		})
		.from(users)
		.where(eq(users.email, googleUser.email));

	if (user) {
		// Update existing user with Google ID
		await db.update(users).set({ googleId: googleUser.id }).where(eq(users.id, user.id));
		return user;
	}

	// Create new user
	const [newUser] = await db
		.insert(users)
		.values({
			email: googleUser.email,
			name: googleUser.name,
			googleId: googleUser.id,
			role: 'prayer_partner',
			isStaff: false
		})
		.returning({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isStaff: users.isStaff
		});

	return newUser;
}
