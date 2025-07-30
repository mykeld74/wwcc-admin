import { json } from '@sveltejs/kit';
import { getPrayerRequests } from '$lib/server/prayerRequests';
import { emailService } from '$lib/server/email';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, cookies }: { request: Request; cookies: any }) => {
	try {
		const body = await request.json();
		const { startDate, endDate, includeStaffOnly, recipients } = body;

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

		// Get recipients from environment or use provided ones
		const emailRecipients = recipients || env.DEFAULT_EMAIL_RECIPIENTS?.split(',') || [];

		if (emailRecipients.length === 0) {
			return json({ error: 'No email recipients configured' }, { status: 400 });
		}

		const filters = {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			includeStaffOnly
		};

		const requests = await getPrayerRequests(filters, userIsStaff);

		if (requests.length === 0) {
			return json(
				{ error: 'No prayer requests found for the specified criteria' },
				{ status: 404 }
			);
		}

		// Send email
		const success = await emailService.sendPrayerRequestsEmail(requests, emailRecipients, {
			startDate: filters.startDate,
			endDate: filters.endDate,
			includeStaffOnly
		});

		if (success) {
			return json({
				success: true,
				count: requests.length,
				recipients: emailRecipients.length
			});
		} else {
			return json({ error: 'Failed to send email' }, { status: 500 });
		}
	} catch (error) {
		console.error('Error sending email:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
