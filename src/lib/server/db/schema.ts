import { pgTable, serial, text, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	passwordHash: text('password_hash'),
	googleId: varchar('google_id', { length: 255 }),
	role: varchar('role', { length: 50 }).notNull().default('prayer_partner'),
	isStaff: boolean('is_staff').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const prayerRequests = pgTable('prayer_requests', {
	id: serial('id').primaryKey(),
	request: text('request').notNull(),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }),
	isStaffOnly: boolean('is_staff_only').default(false).notNull(),
	submittedAt: timestamp('submitted_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions)
}));

// Note: prayerRequests table doesn't have a userId field, so no relations defined

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));
