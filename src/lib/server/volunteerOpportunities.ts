import { db } from './db';
import { volunteerOpportunities } from './db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export interface VolunteerOpportunity {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	team: string;
	sendTo: string;
	department: string;
	message: string | null;
	addressed: boolean;
	submittedAt: Date;
	updatedAt: Date;
}

export interface CreateVolunteerOpportunityData {
	name: string;
	email: string;
	phone?: string;
	team: string;
	sendTo: string;
	department: string;
	message?: string;
}

export interface VolunteerOpportunityFilters {
	team?: string;
	departments?: string[]; // For multiple department filtering
	addressed?: boolean;
	startDate?: Date;
	endDate?: Date;
}

export async function createVolunteerOpportunity(
	data: CreateVolunteerOpportunityData
): Promise<VolunteerOpportunity> {
	const [opportunity] = await db
		.insert(volunteerOpportunities)
		.values({
			name: data.name,
			email: data.email,
			phone: data.phone || null,
			team: data.team,
			sendTo: data.sendTo,
			department: data.department,
			message: data.message || null
		})
		.returning();

	return opportunity;
}

export async function getVolunteerOpportunities(
	filters: VolunteerOpportunityFilters = {}
): Promise<VolunteerOpportunity[]> {
	const conditions = [];

	if (filters.team) {
		conditions.push(eq(volunteerOpportunities.team, filters.team));
	}

	if (filters.departments && filters.departments.length > 0) {
		conditions.push(inArray(volunteerOpportunities.department, filters.departments));
	}

	if (filters.addressed !== undefined) {
		conditions.push(eq(volunteerOpportunities.addressed, filters.addressed));
	}

	if (filters.startDate) {
		conditions.push(volunteerOpportunities.submittedAt >= filters.startDate);
	}

	if (filters.endDate) {
		conditions.push(volunteerOpportunities.submittedAt <= filters.endDate);
	}

	const query = db.select().from(volunteerOpportunities);

	if (conditions.length > 0) {
		query.where(conditions);
	}

	query.orderBy(desc(volunteerOpportunities.submittedAt));

	return await query;
}

export async function getVolunteerOpportunityById(
	id: number
): Promise<VolunteerOpportunity | null> {
	const [opportunity] = await db
		.select()
		.from(volunteerOpportunities)
		.where(eq(volunteerOpportunities.id, id));
	return opportunity || null;
}

export async function updateVolunteerOpportunity(
	id: number,
	data: Partial<CreateVolunteerOpportunityData> & { addressed?: boolean }
): Promise<VolunteerOpportunity | null> {
	const [opportunity] = await db
		.update(volunteerOpportunities)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(eq(volunteerOpportunities.id, id))
		.returning();

	return opportunity || null;
}

export async function deleteVolunteerOpportunity(id: number): Promise<boolean> {
	const result = await db.delete(volunteerOpportunities).where(eq(volunteerOpportunities.id, id));
	return result.rowCount > 0;
}

export async function getVolunteerOpportunityStats(): Promise<{
	total: number;
	addressed: number;
	unaddressed: number;
	recent: number;
	teams: { [key: string]: number };
}> {
	const allOpportunities = await getVolunteerOpportunities();
	const recentOpportunities = await getVolunteerOpportunities({
		startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
	});

	const teams: { [key: string]: number } = {};
	allOpportunities.forEach((opp) => {
		teams[opp.team] = (teams[opp.team] || 0) + 1;
	});

	return {
		total: allOpportunities.length,
		addressed: allOpportunities.filter((opp) => opp.addressed).length,
		unaddressed: allOpportunities.filter((opp) => !opp.addressed).length,
		recent: recentOpportunities.length,
		teams
	};
}
