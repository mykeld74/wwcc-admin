import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { prayerRequests } from '$lib/server/db/schema';

export const GET = async () => {
	try {
		// Get all prayer requests without any filtering
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
