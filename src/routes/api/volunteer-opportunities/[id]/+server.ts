import { json } from '@sveltejs/kit';
import {
	getVolunteerOpportunityById,
	updateVolunteerOpportunity,
	deleteVolunteerOpportunity
} from '$lib/server/volunteerOpportunities';
import { validateSession } from '$lib/server/auth';

export const GET = async ({ params, cookies }: { params: { id: string }; cookies: any }) => {
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

		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid ID' }, { status: 400 });
		}

		const opportunity = await getVolunteerOpportunityById(id);
		if (!opportunity) {
			return json({ error: 'Volunteer opportunity not found' }, { status: 404 });
		}

		return json(opportunity);
	} catch (error) {
		console.error('Error fetching volunteer opportunity:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PATCH = async ({
	params,
	request,
	cookies
}: {
	params: { id: string };
	request: Request;
	cookies: any;
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

		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid ID' }, { status: 400 });
		}

		const body = await request.json();
		const { name, email, phone, team, sendTo, message, addressed } = body;

		// Validate email format if provided
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return json({ error: 'Invalid email format' }, { status: 400 });
			}
		}

		const updatedOpportunity = await updateVolunteerOpportunity(id, {
			name,
			email,
			phone,
			team,
			sendTo,
			message,
			addressed
		});

		if (!updatedOpportunity) {
			return json({ error: 'Volunteer opportunity not found' }, { status: 404 });
		}

		return json(updatedOpportunity);
	} catch (error) {
		console.error('Error updating volunteer opportunity:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE = async ({ params, cookies }: { params: { id: string }; cookies: any }) => {
	try {
		// Check if user is authenticated and has admin permissions
		const sessionToken = cookies.get('session');
		let userIsAdmin = false;

		if (sessionToken) {
			try {
				const user = await validateSession(sessionToken);
				userIsAdmin = user?.role === 'admin';
			} catch (error) {
				console.error('Error validating session:', error);
			}
		}

		if (!userIsAdmin) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const id = parseInt(params.id);
		if (isNaN(id)) {
			return json({ error: 'Invalid ID' }, { status: 400 });
		}

		const success = await deleteVolunteerOpportunity(id);
		if (!success) {
			return json({ error: 'Volunteer opportunity not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting volunteer opportunity:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
