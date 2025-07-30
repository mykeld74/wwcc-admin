import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

async function setupDatabase() {
	try {
		console.log('Setting up database...');

		// Create tables
		console.log('Creating tables...');
		await db.execute(`
			CREATE TABLE IF NOT EXISTS "users" (
				"id" serial PRIMARY KEY NOT NULL,
				"email" varchar(255) NOT NULL UNIQUE,
				"name" varchar(255) NOT NULL,
				"password_hash" text NOT NULL,
				"role" varchar(50) NOT NULL DEFAULT 'prayer_partner',
				"is_staff" boolean DEFAULT false NOT NULL,
				"created_at" timestamp DEFAULT now() NOT NULL,
				"updated_at" timestamp DEFAULT now() NOT NULL
			)
		`);

		await db.execute(`
			CREATE TABLE IF NOT EXISTS "prayer_requests" (
				"id" serial PRIMARY KEY NOT NULL,
				"request" text NOT NULL,
				"name" varchar(255),
				"email" varchar(255),
				"is_staff_only" boolean DEFAULT false NOT NULL,
				"submitted_at" timestamp DEFAULT now() NOT NULL,
				"updated_at" timestamp DEFAULT now() NOT NULL
			)
		`);

		await db.execute(`
			CREATE TABLE IF NOT EXISTS "sessions" (
				"id" serial PRIMARY KEY NOT NULL,
				"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
				"token" text NOT NULL UNIQUE,
				"expires_at" timestamp NOT NULL,
				"created_at" timestamp DEFAULT now() NOT NULL
			)
		`);

		console.log('✅ Tables created successfully!');

		// Check if admin already exists
		console.log('Checking for existing admin user...');
		const [existingAdmin] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, 'admin@westwoods.com'));

		if (existingAdmin) {
			console.log('Admin user already exists!');
			console.log('Email: admin@westwoods.com');
			console.log('Password: admin123');
			return;
		}

		console.log('Creating admin user...');

		// Hash password
		const passwordHash = await bcrypt.hash('admin123', 12);

		// Create admin user
		await db.insert(users).values({
			email: 'admin@westwoods.com',
			name: 'Administrator',
			passwordHash,
			role: 'admin',
			isStaff: true
		});

		console.log('✅ Admin user created successfully!');
		console.log('Email: admin@westwoods.com');
		console.log('Password: admin123');
		console.log('Role: Administrator');
	} catch (error) {
		console.error('❌ Failed to setup database:', error);
		process.exit(1);
	}
}

setupDatabase();
