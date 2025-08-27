import { json } from '@sveltejs/kit';
import {
	createVolunteerOpportunity,
	getVolunteerOpportunities,
	getVolunteerOpportunityStats
} from '$lib/server/volunteerOpportunities';
import { validateSession } from '$lib/server/auth';

// Simple in-memory rate limiting for volunteer opportunities
const volunteerRequestCounts = new Map<string, { count: number; resetTime: number }>();
const VOLUNTEER_RATE_LIMIT = 3; // Max 3 opportunities per hour per IP
const VOLUNTEER_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export const GET = async ({
	url,
	cookies
}: {
	url: URL;
	cookies: { get: (key: string) => string | undefined };
}) => {
	try {
		// Check if user is authenticated and has staff permissions
		const sessionToken = cookies.get('session');
		let userIsStaff = false;

		if (sessionToken) {
			try {
				const user = await validateSession(sessionToken);
				userIsStaff = user?.role === 'admin' || user?.role === 'staff';
			} catch (error) {
				console.error('Error validating session:', error);
			}
		}

		if (!userIsStaff) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Parse query parameters
		const departments = url.searchParams.getAll('department'); // Get all department parameters
		const addressedParam = url.searchParams.get('addressed');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');
		const stats = url.searchParams.get('stats');

		// If stats parameter is present, return statistics
		if (stats === 'true') {
			const statistics = await getVolunteerOpportunityStats();
			return json(statistics);
		}

		// Build filters
		const filters = {
			departments: departments.length > 0 ? departments : undefined, // Pass array of departments
			addressed: addressedParam ? addressedParam === 'true' : undefined,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined
		};

		const opportunities = await getVolunteerOpportunities(filters);
		return json(opportunities);
	} catch (error) {
		console.error('Error fetching volunteer opportunities:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST = async ({ request }: { request: Request }) => {
	try {
		// Basic rate limiting check
		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

		// Simple in-memory rate limiting for volunteer opportunities
		const now = Date.now();
		const userData = volunteerRequestCounts.get(ip);

		if (!userData || now > userData.resetTime) {
			volunteerRequestCounts.set(ip, { count: 1, resetTime: now + VOLUNTEER_RATE_LIMIT_WINDOW });
		} else if (userData.count >= VOLUNTEER_RATE_LIMIT) {
			return json(
				{
					error: 'Rate limit exceeded. Please wait before submitting another opportunity.'
				},
				{ status: 429 }
			);
		} else {
			userData.count++;
		}

		const body = await request.json();
		const { name, email, phone, team, sendTo, department, message } = body;

		// Validate required fields
		if (!name || !email || !team || !sendTo || !department) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate field lengths
		if (name.length > 100) {
			return json({ error: 'Name is too long (max 100 characters)' }, { status: 400 });
		}

		if (email.length > 255) {
			return json({ error: 'Email is too long' }, { status: 400 });
		}

		if (phone && phone.length > 20) {
			return json({ error: 'Phone number is too long (max 20 characters)' }, { status: 400 });
		}

		if (team.length > 100) {
			return json({ error: 'Team name is too long (max 100 characters)' }, { status: 400 });
		}

		if (sendTo.length > 100) {
			return json({ error: 'Send to field is too long (max 100 characters)' }, { status: 400 });
		}

		if (department.length > 100) {
			return json({ error: 'Department name is too long (max 100 characters)' }, { status: 400 });
		}

		if (message && message.length > 1000) {
			return json({ error: 'Message is too long (max 1000 characters)' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate phone format if provided
		if (phone) {
			const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
			if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
				return json({ error: 'Invalid phone number format' }, { status: 400 });
			}
		}

		const opportunity = await createVolunteerOpportunity({
			name,
			email,
			phone,
			team,
			sendTo,
			department,
			message
		});

		return json(opportunity, { status: 201 });
	} catch (error) {
		console.error('Error creating volunteer opportunity:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
