import { db } from './db/index';
import { prayerRequests } from './db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export interface PrayerRequest {
	id: number;
	request: string;
	name: string | null;
	email: string | null;
	isStaffOnly: boolean;
	submittedAt: Date;
	updatedAt: Date;
}

export interface CreatePrayerRequestData {
	request: string;
	name?: string;
	email?: string;
	isStaffOnly?: boolean;
}

export interface PrayerRequestFilters {
	startDate?: Date;
	endDate?: Date;
	includeStaffOnly?: boolean;
	limit?: number;
	offset?: number;
}

export async function createPrayerRequest(data: CreatePrayerRequestData): Promise<PrayerRequest> {
	const [prayerRequest] = await db
		.insert(prayerRequests)
		.values({
			request: data.request,
			name: data.name,
			email: data.email,
			isStaffOnly: data.isStaffOnly || false
		})
		.returning();

	return prayerRequest;
}

export async function getPrayerRequests(
	filters: PrayerRequestFilters = {},
	userIsStaff = false
): Promise<PrayerRequest[]> {
	const conditions = [];

	// Filter by date range
	if (filters.startDate) {
		conditions.push(gte(prayerRequests.submittedAt, filters.startDate));
	}
	if (filters.endDate) {
		conditions.push(lte(prayerRequests.submittedAt, filters.endDate));
	}

	// Filter staff-only requests based on user permissions
	if (!userIsStaff) {
		// Non-staff users only see public requests
		conditions.push(eq(prayerRequests.isStaffOnly, false));
	} else if (filters.includeStaffOnly === false) {
		// Staff users can optionally filter to only show public requests
		conditions.push(eq(prayerRequests.isStaffOnly, false));
	} else if (filters.includeStaffOnly === true) {
		// Staff users can optionally filter to only show staff-only requests
		conditions.push(eq(prayerRequests.isStaffOnly, true));
	}
	// If userIsStaff is true and includeStaffOnly is not explicitly set, show all requests

	const query = db.select().from(prayerRequests);

	if (conditions.length > 0) {
		query.where(and(...conditions));
	}

	query.orderBy(desc(prayerRequests.submittedAt));

	if (filters.limit) {
		query.limit(filters.limit);
	}

	if (filters.offset) {
		query.offset(filters.offset);
	}

	return await query;
}

export async function getPrayerRequestById(id: number): Promise<PrayerRequest | null> {
	const [prayerRequest] = await db.select().from(prayerRequests).where(eq(prayerRequests.id, id));
	return prayerRequest || null;
}

export async function updatePrayerRequest(
	id: number,
	data: Partial<CreatePrayerRequestData>
): Promise<PrayerRequest | null> {
	const [prayerRequest] = await db
		.update(prayerRequests)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(eq(prayerRequests.id, id))
		.returning();

	return prayerRequest || null;
}

export async function deletePrayerRequest(id: number): Promise<boolean> {
	const result = await db.delete(prayerRequests).where(eq(prayerRequests.id, id));
	return result.rowCount > 0;
}

export async function getPrayerRequestStats(userIsStaff = false): Promise<{
	total: number;
	staffOnly: number;
	public: number;
	recent: number;
}> {
	const allRequests = await getPrayerRequests({}, userIsStaff);
	const recentRequests = await getPrayerRequests(
		{
			startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
		},
		userIsStaff
	);

	return {
		total: allRequests.length,
		staffOnly: allRequests.filter((r) => r.isStaffOnly).length,
		public: allRequests.filter((r) => !r.isStaffOnly).length,
		recent: recentRequests.length
	};
}
