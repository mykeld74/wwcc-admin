import { json } from '@sveltejs/kit';
import { createPrayerRequest, getPrayerRequests } from '$lib/server/prayerRequests';

export const POST = async ({ request }: { request: Request }) => {
	try {
		const body = await request.json();
		const { request: prayerRequest, name, email, isStaffOnly } = body;

		if (!prayerRequest || typeof prayerRequest !== 'string') {
			return json({ error: 'Prayer request is required' }, { status: 400 });
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

		console.log(
			'API Debug - User:',
			user?.email,
			'IsStaff:',
			userIsStaff,
			'ShowPublicOnly:',
			includeStaffOnly === false,
			'ShowStaffOnly:',
			includeStaffOnly === true
		);

		const filters = {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			includeStaffOnly
		};

		const requests = await getPrayerRequests(filters, userIsStaff);
		console.log('API Debug - Found requests:', requests.length);
		return json(requests);
	} catch (error) {
		console.error('Error fetching prayer requests:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
