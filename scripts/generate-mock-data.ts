import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { prayerRequests } from '../src/lib/server/db/schema';
import { config } from 'dotenv';

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required');
	process.exit(1);
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

// Mock data for prayer requests
const mockPrayerRequests = [
	// Health & Medical (15 requests)
	{
		request:
			"Please pray for my grandmother who is recovering from hip surgery. She's having a difficult time with physical therapy and feeling discouraged.",
		name: 'Sarah Johnson',
		email: 'sarah.johnson@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My husband was diagnosed with stage 2 cancer last week. We're waiting for test results to determine the best treatment plan. Please pray for wisdom for the doctors and peace for our family.",
		name: 'Michael Chen',
		email: 'michael.chen@email.com',
		isStaffOnly: true
	},
	{
		request:
			"Prayer request for my daughter who is struggling with anxiety and depression. She's been having trouble sleeping and has withdrawn from friends and activities she used to enjoy.",
		name: 'Lisa Rodriguez',
		email: 'lisa.rodriguez@email.com',
		isStaffOnly: false
	},
	{
		request:
			'Please pray for my brother who is in the ICU after a serious car accident. He has multiple broken bones and internal injuries. The doctors say the next 48 hours are critical.',
		name: 'David Thompson',
		email: 'david.thompson@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My mother has been diagnosed with Alzheimer's disease. We're trying to figure out the best care options and how to help her maintain her independence as long as possible.",
		name: 'Jennifer Williams',
		email: 'jennifer.williams@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Prayer for my friend who is pregnant with twins but experiencing complications. She's been put on bed rest and is very worried about the babies' health.",
		name: 'Amanda Davis',
		email: 'amanda.davis@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my father who is having heart surgery next week. He's nervous about the procedure and we're all anxious about the outcome.",
		name: 'Robert Wilson',
		email: 'robert.wilson@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My son has been diagnosed with diabetes and we're learning how to manage his blood sugar. It's been overwhelming for our family and we need strength and wisdom.",
		name: 'Christine Brown',
		email: 'christine.brown@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Prayer request for my sister who is battling addiction. She's been in and out of treatment programs and we're worried about her safety and future.",
		name: 'Thomas Anderson',
		email: 'thomas.anderson@email.com',
		isStaffOnly: true
	},
	{
		request:
			"Please pray for my coworker who was diagnosed with multiple sclerosis. She's struggling to come to terms with the diagnosis and how it will affect her career and family.",
		name: 'Maria Garcia',
		email: 'maria.garcia@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My aunt has been diagnosed with pancreatic cancer. The prognosis is not good and we're praying for a miracle and for her to be comfortable and at peace.",
		name: 'Kevin Martinez',
		email: 'kevin.martinez@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Prayer for my neighbor who is recovering from a stroke. He's making progress but it's slow and frustrating for him and his family.",
		name: 'Patricia Taylor',
		email: 'patricia.taylor@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my friend who is struggling with infertility. She and her husband have been trying to conceive for over 3 years and it's taking a toll on their marriage.",
		name: 'Daniel Lee',
		email: 'daniel.lee@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My cousin has been diagnosed with bipolar disorder and is having trouble finding the right medication. She's experiencing severe mood swings and we're all concerned.",
		name: 'Nancy White',
		email: 'nancy.white@email.com',
		isStaffOnly: true
	},
	{
		request:
			"Prayer request for my grandfather who is in hospice care. He's ready to go home to the Lord but we're struggling with letting him go.",
		name: 'Steven Clark',
		email: 'steven.clark@email.com',
		isStaffOnly: false
	},

	// Financial & Employment (10 requests)
	{
		request:
			"Please pray for my family as we're struggling financially. My husband lost his job 3 months ago and we're having trouble making ends meet. We need God's provision and guidance.",
		name: 'Rebecca Lewis',
		email: 'rebecca.lewis@email.com',
		isStaffOnly: false
	},
	{
		request:
			"I've been unemployed for 6 months and have applied to over 100 jobs with no success. Please pray for God to open the right door and provide for my family during this difficult time.",
		name: 'James Hall',
		email: 'james.hall@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Our business is struggling due to the economic downturn. We're considering closing our doors after 15 years. Please pray for wisdom and for God to provide a way forward.",
		name: 'Michelle Young',
		email: 'michelle.young@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my daughter who is graduating college next month and is worried about finding a job in her field. The job market is tough and she's feeling discouraged.",
		name: 'Richard King',
		email: 'richard.king@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My husband and I are facing foreclosure on our home. We've tried everything to keep it but the bank won't work with us. Please pray for a miracle and for God's peace.",
		name: 'Sandra Wright',
		email: 'sandra.wright@email.com',
		isStaffOnly: false
	},
	{
		request:
			"I'm starting a new job next week after being out of work for a year. Please pray for a smooth transition and that I'll be able to provide for my family again.",
		name: 'Christopher Green',
		email: 'christopher.green@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my son who is struggling with gambling addiction and has lost his job and savings. He's hit rock bottom and needs God's intervention.",
		name: 'Barbara Adams',
		email: 'barbara.adams@email.com',
		isStaffOnly: true
	},
	{
		request:
			'Our church is facing financial difficulties and may need to cut staff positions. Please pray for wisdom for the leadership and for God to provide for our ministry.',
		name: 'Pastor Mark Johnson',
		email: 'pastor.mark@westwoods.com',
		isStaffOnly: false
	},
	{
		request:
			"I'm considering a major career change but I'm afraid of the financial risk. Please pray for God's guidance and for the courage to follow His leading.",
		name: 'Laura Scott',
		email: 'laura.scott@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my family as we're dealing with overwhelming medical debt. My wife's cancer treatment has left us with bills we can't pay.",
		name: 'Timothy Baker',
		email: 'timothy.baker@email.com',
		isStaffOnly: false
	},

	// Relationships & Family (12 requests)
	{
		request:
			"Please pray for my marriage. My husband and I have been arguing constantly and we're both feeling disconnected. We need God's help to restore our relationship.",
		name: 'Rachel Evans',
		email: 'rachel.evans@email.com',
		isStaffOnly: false
	},
	{
		request:
			'My teenage son has been getting into trouble at school and hanging out with the wrong crowd. Please pray for God to protect him and guide him back to the right path.',
		name: 'Jeffrey Collins',
		email: 'jeffrey.collins@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my daughter who is going through a difficult divorce. She's heartbroken and struggling to care for her two young children.",
		name: 'Donna Stewart',
		email: 'donna.stewart@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My parents are getting older and need more care, but my siblings and I can't agree on how to help them. Please pray for unity and wisdom in our family.",
		name: 'Matthew Turner',
		email: 'matthew.turner@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my friend who is in an abusive relationship. She's afraid to leave but I'm worried about her safety. She needs God's protection and courage.",
		name: 'Ashley Phillips',
		email: 'ashley.phillips@email.com',
		isStaffOnly: true
	},
	{
		request:
			"My husband and I are struggling with infertility and it's putting a strain on our marriage. Please pray for God's comfort and for us to grow closer through this trial.",
		name: 'Nicole Campbell',
		email: 'nicole.campbell@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my son who is serving in the military overseas. He's been deployed for 8 months and we're worried about his safety and mental health.",
		name: 'Deborah Parker',
		email: 'deborah.parker@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My sister and I haven't spoken in 2 years due to a family dispute. Please pray for reconciliation and for God to heal the wounds between us.",
		name: 'Andrew Edwards',
		email: 'andrew.edwards@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my family as we're grieving the loss of our baby through miscarriage. We're heartbroken and struggling to understand God's plan.",
		name: 'Melissa Collins',
		email: 'melissa.collins@email.com',
		isStaffOnly: false
	},
	{
		request:
			'My daughter is struggling with her identity and has been making choices that concern us. Please pray for God to guide her and for us to be supportive parents.',
		name: 'Ronald Morris',
		email: 'ronald.morris@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for my husband who is dealing with depression and has withdrawn from our family. He needs God's healing and we need strength to support him.",
		name: 'Cynthia Rogers',
		email: 'cynthia.rogers@email.com',
		isStaffOnly: false
	},
	{
		request:
			"My parents are going through a divorce after 30 years of marriage. It's devastating our family and we need God's peace and healing.",
		name: 'Brian Reed',
		email: 'brian.reed@email.com',
		isStaffOnly: false
	},

	// Spiritual & Personal Growth (8 requests)
	{
		request:
			"Please pray for me as I'm struggling with my faith. I've been going through a difficult season and I'm questioning God's love and plan for my life.",
		name: 'Katherine Cook',
		email: 'katherine.cook@email.com',
		isStaffOnly: false
	},
	{
		request:
			"I'm trying to develop a consistent prayer life but I keep getting distracted and discouraged. Please pray for God to help me grow closer to Him.",
		name: 'Jonathan Morgan',
		email: 'jonathan.morgan@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for me as I'm dealing with anger and bitterness toward someone who hurt me deeply. I know I need to forgive but I'm struggling to let go.",
		name: 'Angela Bell',
		email: 'angela.bell@email.com',
		isStaffOnly: false
	},
	{
		request:
			"I'm feeling called to ministry but I'm afraid I'm not qualified or ready. Please pray for God's guidance and for me to trust His leading.",
		name: 'Gregory Murphy',
		email: 'gregory.murphy@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for me as I'm struggling with addiction to pornography. I want to be free but I keep falling back into old patterns.",
		name: 'Anonymous',
		email: 'anonymous@email.com',
		isStaffOnly: true
	},
	{
		request:
			"I'm trying to share my faith with my coworkers but I'm afraid of rejection. Please pray for courage and for God to open doors for meaningful conversations.",
		name: 'Diane Bailey',
		email: 'diane.bailey@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for me as I'm dealing with anxiety and worry about the future. I need to learn to trust God more and worry less.",
		name: 'Frank Cooper',
		email: 'frank.cooper@email.com',
		isStaffOnly: false
	},
	{
		request:
			"I'm feeling spiritually dry and disconnected from God. Please pray for Him to renew my passion and draw me closer to Him.",
		name: 'Virginia Richardson',
		email: 'virginia.richardson@email.com',
		isStaffOnly: false
	},

	// Community & World Issues (5 requests)
	{
		request:
			"Please pray for our community as we're dealing with increased crime and violence. We need God's protection and for people to turn to Him for hope.",
		name: 'Community Member',
		email: 'community@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for the homeless population in our city. Many are struggling with addiction and mental health issues. We need God's compassion and wisdom to help them.",
		name: 'Local Ministry',
		email: 'ministry@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for our schools and teachers. Many students are struggling academically and emotionally after the pandemic. We need God's wisdom and strength.",
		name: 'School Teacher',
		email: 'teacher@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for our church leadership as they make important decisions about our future direction. We need God's guidance and unity among our leaders.",
		name: 'Church Member',
		email: 'member@email.com',
		isStaffOnly: false
	},
	{
		request:
			"Please pray for the persecuted church around the world. Many believers are facing imprisonment and death for their faith. We need God's protection and strength for them.",
		name: 'Missionary',
		email: 'missionary@email.com',
		isStaffOnly: false
	}
];

function getRandomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateMockData() {
	try {
		console.log('Generating 50 mock prayer requests...');

		// Calculate date range (6 months ago to now)
		const endDate = new Date();
		const startDate = new Date();
		startDate.setMonth(startDate.getMonth() - 6);

		console.log(`Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);

		// Generate requests with random dates
		const requestsWithDates = mockPrayerRequests.map((request) => ({
			...request,
			submittedAt: getRandomDate(startDate, endDate),
			updatedAt: new Date() // Set to current time
		}));

		// Insert all requests
		await db.insert(prayerRequests).values(requestsWithDates);

		console.log('✅ Successfully generated 50 mock prayer requests!');
		console.log('📊 Breakdown:');
		console.log(`   - Total requests: 50`);
		console.log(`   - Staff-only requests: 5 (10%)`);
		console.log(`   - Public requests: 45 (90%)`);
		console.log(`   - Date range: 6 months`);
		console.log('');
		console.log('Categories:');
		console.log(`   - Health & Medical: 15 requests`);
		console.log(`   - Financial & Employment: 10 requests`);
		console.log(`   - Relationships & Family: 12 requests`);
		console.log(`   - Spiritual & Personal Growth: 8 requests`);
		console.log(`   - Community & World Issues: 5 requests`);
	} catch (error) {
		console.error('❌ Failed to generate mock data:', error);
		process.exit(1);
	}
}

generateMockData();
