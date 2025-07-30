#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const client = neon(DATABASE_URL);

async function createAdmin() {
	try {
		// Check if admin already exists
		const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [
			'admin@westwoods.org'
		]);

		if (existingAdmin.rows.length > 0) {
			console.log('Admin user already exists');
			return;
		}

		// Create admin user
		const passwordHash = await bcrypt.hash('admin123', 12);

		await client.query(
			`
			INSERT INTO users (email, name, password_hash, is_staff, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())
		`,
			['admin@westwoods.org', 'Admin User', passwordHash, true]
		);

		console.log('✅ Admin user created successfully!');
		console.log('Email: admin@westwoods.org');
		console.log('Password: admin123');
		console.log('\n⚠️  Please change the password after first login!');
	} catch (error) {
		console.error('❌ Error creating admin user:', error.message);
		process.exit(1);
	}
}

createAdmin();
