import { json } from '@sveltejs/kit';
import { createPrayerRequest, getPrayerRequests } from '$lib/server/prayerRequests';

// Simple in-memory rate limiting (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const userData = requestCounts.get(ip);

	if (!userData || now > userData.resetTime) {
		requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (userData.count >= RATE_LIMIT) {
		return false;
	}

	userData.count++;
	return true;
}

export const POST = async ({ request }: { request: Request }) => {
	try {
		// Basic rate limiting check
		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

		if (!checkRateLimit(ip)) {
			return json(
				{
					error: 'Rate limit exceeded. Please wait before submitting another request.'
				},
				{ status: 429 }
			);
		}

		const body = await request.json();
		const { request: prayerRequest, name, email, isStaffOnly } = body;

		if (!prayerRequest || typeof prayerRequest !== 'string') {
			return json({ error: 'Prayer request is required' }, { status: 400 });
		}

		// Validate prayer request length
		if (prayerRequest.length > 1000) {
			return json({ error: 'Prayer request is too long (max 1000 characters)' }, { status: 400 });
		}

		// Validate name length
		if (name && name.length > 100) {
			return json({ error: 'Name is too long (max 100 characters)' }, { status: 400 });
		}

		// Validate email format if provided
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return json({ error: 'Invalid email format' }, { status: 400 });
			}
		}

		const newRequest = await createPrayerRequest({
			request: prayerRequest,
			name,
			email,
			isStaffOnly: Boolean(isStaffOnly)
		});

		return json(newRequest, { status: 201 });
	} catch (error) {
		console.error('Error creating prayer request:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET = async ({
	url,
	cookies
}: {
	url: URL;
	cookies: { get: (key: string) => string | undefined };
}) => {
	try {
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');
		const includeStaffOnlyParam = url.searchParams.get('includeStaffOnly');
		const staffOnlyParam = url.searchParams.get('staffOnly');

		// For staff users: if includeStaffOnly is explicitly 'false', filter to public only
		// If staffOnly is 'true', filter to staff-only only
		// Otherwise, show all requests (including staff-only)
		let includeStaffOnly: boolean | undefined = undefined;
		if (includeStaffOnlyParam === 'false') {
			includeStaffOnly = false;
		} else if (staffOnlyParam === 'true') {
			includeStaffOnly = true;
		}

		// Check if user is authenticated and has staff permissions
		const sessionToken = cookies.get('session');
		let userIsStaff = false;
		let user = null;

		if (sessionToken) {
			try {
				const { validateSession } = await import('$lib/server/auth');
				user = await validateSession(sessionToken);
				userIsStaff = user?.isStaff || false;
			} catch (error) {
				console.error('Error validating session:', error);
			}
		}

		// Debug logging removed for production

		const filters = {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			includeStaffOnly
		};

		const requests = await getPrayerRequests(filters, userIsStaff);
		return json(requests);
	} catch (error) {
		console.error('Error fetching prayer requests:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
