import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { prayerRequests } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';

export const GET = async ({ cookies }: { cookies: any }) => {
	try {
		// Check if user is authenticated and has admin permissions
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await validateSession(sessionToken);
		if (!user || user.role !== 'admin') {
			return json({ error: 'Forbidden - Admin access required' }, { status: 403 });
		}

		// Get all prayer requests without any filtering (admin only)
		const allRequests = await db.select().from(prayerRequests);

		return json({
			total: allRequests.length,
			requests: allRequests,
			public: allRequests.filter((r) => !r.isStaffOnly).length,
			staffOnly: allRequests.filter((r) => r.isStaffOnly).length
		});
	} catch (error) {
		console.error('Debug endpoint error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
