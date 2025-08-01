import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import type { PrayerRequest } from './prayerRequests';

interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

interface EmailOptions {
	to: string | string[];
	subject: string;
	html: string;
}

export class EmailService {
	private transporter: nodemailer.Transporter;

	constructor() {
		const config: EmailConfig = {
			host: env.SMTP_HOST || 'smtp.gmail.com',
			port: parseInt(env.SMTP_PORT || '587'),
			secure: env.SMTP_SECURE === 'true',
			auth: {
				user: env.SMTP_USER || '',
				pass: env.SMTP_PASS || ''
			}
		};

		this.transporter = nodemailer.createTransport(config);
	}

	async sendPrayerRequestsEmail(
		requests: PrayerRequest[],
		recipients: string[],
		options: {
			startDate?: Date;
			endDate?: Date;
			includeStaffOnly?: boolean;
		} = {}
	): Promise<boolean> {
		try {
			const { startDate, endDate, includeStaffOnly } = options;

			// Filter requests based on options
			let filteredRequests = requests;
			if (startDate) {
				filteredRequests = filteredRequests.filter((r) => new Date(r.submittedAt) >= startDate);
			}
			if (endDate) {
				filteredRequests = filteredRequests.filter((r) => new Date(r.submittedAt) <= endDate);
			}
			if (!includeStaffOnly) {
				filteredRequests = filteredRequests.filter((r) => !r.isStaffOnly);
			}

			if (filteredRequests.length === 0) {
				console.log('No prayer requests to send');
				return false;
			}

			const html = this.generatePrayerRequestsHTML(filteredRequests, options);

			const emailOptions: EmailOptions = {
				to: recipients,
				subject: 'Westwoods Prayer Requests',
				html
			};

			await this.transporter.sendMail(emailOptions);
			console.log(`Prayer requests email sent to ${recipients.length} recipients`);
			return true;
		} catch (error) {
			console.error('Error sending prayer requests email:', error);
			return false;
		}
	}

	private generatePrayerRequestsHTML(
		requests: PrayerRequest[],
		options: {
			startDate?: Date;
			endDate?: Date;
			includeStaffOnly?: boolean;
		}
	): string {
		const { startDate, endDate, includeStaffOnly } = options;

		let dateRangeText = '';
		if (startDate && endDate) {
			dateRangeText = ` from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
		} else if (startDate) {
			dateRangeText = ` from ${startDate.toLocaleDateString()}`;
		} else if (endDate) {
			dateRangeText = ` until ${endDate.toLocaleDateString()}`;
		}

		const staffOnlyText = includeStaffOnly ? ' (including staff-only requests)' : '';

		let html = `
			<!DOCTYPE html>
			<html>
			<head></head>
				<meta charset="utf-8">
				<title>Westwoods Prayer Requests</title>
			</head>
			<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
				<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
					<tr>
						<td align="center" style="padding: 20px;">
							<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-collapse: collapse;">
								<tr>
									<td style="background-color: #7C9BA9; color: #ffffff; padding: 20px; text-align: center;">
										<h1 style="margin: 0; font-size: 24px; font-weight: bold;">Westwoods Prayer Requests</h1>
										<p style="margin: 10px 0 0 0; font-size: 16px;">Prayer requests${dateRangeText}${staffOnlyText}</p>
									</td>
								</tr>
		`;

		requests.forEach((request) => {
			const date = new Date(request.submittedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});

			html += `
								<tr>
									<td style="padding: 20px;">
										<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border: 2px solid #000000;  border-collapse: collapse;">
											<tr>
												<td style="padding: 12px;">
													<div style="margin-bottom: 10px; font-size: 16px; line-height: 1.5;">${request.request.replace(/\n/g, '<br>')}</div>
													<table width="100%" cellpadding="0" cellspacing="0">
														<tr>
															<td style="font-size: 14px; color: #666666; padding-top: 15px;">
																<div style="margin-bottom: 5px;"><strong>Submitted:</strong> ${date}</div>
																${request.name ? `<div style="margin-bottom: 5px;"><strong>From:</strong> ${request.name}</div>` : ''}
																${request.isStaffOnly ? '<div style="margin-top: 10px;"><span style="background-color: #ffd700; color: #333333; padding: 4px 8px; font-size: 12px; font-weight: bold;">Staff Only</span></div>' : ''}
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</table>
									</td>
								</tr>
			`;
		});

		html += `
								<tr>
									<td style="padding: 20px; border-top: 1px solid #eeeeee; text-align: center;">
										<div style="font-size: 14px; color: #666666;">
											<p style="margin: 5px 0;">This email was automatically generated by the Westwoods Prayer Request system.</p>
											<p style="margin: 5px 0;"><strong>Total requests: ${requests.length}</strong></p>
										</div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
			</html>
		`;

		return html;
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			console.log('Email service connection verified');
			return true;
		} catch (error) {
			console.error('Email service connection failed:', error);
			return false;
		}
	}
}

export const emailService = new EmailService();
