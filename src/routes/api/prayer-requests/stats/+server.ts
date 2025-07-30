import { json } from '@sveltejs/kit';
import { getPrayerRequestStats } from '$lib/server/prayerRequests';

export const GET = async ({ cookies }: { cookies: any }) => {
	try {
		// Check if user is authenticated and has staff permissions
		const sessionToken = cookies.get('session');
		let userIsStaff = false;

		if (sessionToken) {
			try {
				const { validateSession } = await import('$lib/server/auth');
				const user = await validateSession(sessionToken);
				userIsStaff = user?.isStaff || false;
			} catch (error) {
				console.error('Error validating session:', error);
			}
		}

		if (!userIsStaff) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const stats = await getPrayerRequestStats(userIsStaff);
		return json(stats);
	} catch (error) {
		console.error('Error fetching stats:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
