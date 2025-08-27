<script lang="ts">
	import { checkAuthStatus } from '$lib/auth';

	interface PrayerRequest {
		id: number;
		request: string;
		name: string | null;
		email: string | null;
		isStaffOnly: boolean;
		submittedAt: string;
		updatedAt: string;
	}

	let requests = $state<PrayerRequest[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let userIsStaff = $state(false);

	// Filters
	let startDate = $state('');
	let endDate = $state('');
	let showStaffOnly = $state(false);
	let showFilters = $state(true);

	// Set default dates (one week ago to today)
	$effect(() => {
		const today = new Date();
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(today.getDate() - 7);

		// Format dates for input fields (YYYY-MM-DD)
		startDate = oneWeekAgo.toISOString().split('T')[0];
		endDate = today.toISOString().split('T')[0];
	});

	// Set default staff filter for staff users
	$effect(() => {
		if (userIsStaff) {
			showStaffOnly = true;
		}
	});

	// Print state
	let isPrinting = $state(false);

	// Load requests and check permissions on mount
	$effect(() => {
		loadRequests();
		checkUserPermissions();
	});

	async function checkUserPermissions() {
		try {
			const { user, isAuthenticated } = await checkAuthStatus();
			if (isAuthenticated && user) {
				userIsStaff = user.role === 'admin' || user.role === 'staff' || false;
			} else {
				userIsStaff = false;
			}
		} catch (error) {
			console.error('Failed to check user permissions:', error);
			userIsStaff = false;
		}
	}

	async function loadRequests() {
		isLoading = true;
		error = '';

		try {
			const params = new URLSearchParams();
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);
			if (userIsStaff && !showStaffOnly) {
				// For staff users, if showStaffOnly is unchecked, exclude staff-only requests
				params.append('includeStaffOnly', 'false');
			}
			// If showStaffOnly is checked, don't add any staff filter - show all requests

			// Debug logging removed for production

			const response = await fetch(`/api/prayer-requests?${params}`);

			if (response.ok) {
				requests = await response.json();
			} else {
				error = 'Failed to load prayer requests.';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function applyFilters() {
		await loadRequests();
	}

	function clearFilters() {
		startDate = '';
		endDate = '';
		showStaffOnly = false;
		loadRequests();
	}

	function setDateRange(days: number) {
		const today = new Date();
		const startDateObj = new Date();
		startDateObj.setDate(today.getDate() - days);

		startDate = startDateObj.toISOString().split('T')[0];
		endDate = today.toISOString().split('T')[0];
		loadRequests();
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function printRequests() {
		isPrinting = true;
		setTimeout(() => {
			window.print();
			isPrinting = false;
		}, 100);
	}

	async function emailRequests() {
		try {
			const response = await fetch('/api/prayer-requests/email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					startDate,
					endDate,
					includeStaffOnly: userIsStaff && !showStaffOnly ? false : undefined
				})
			});

			if (response.ok) {
				alert('Prayer requests have been emailed successfully.');
			} else {
				alert('Failed to email prayer requests.');
			}
		} catch (error) {
			alert('Network error. Please try again.');
		}
	}
</script>

<div class="prayerList">
	<div class="header">
		<h2>Prayer Requests</h2>
		<div class="actions">
			<button onclick={() => (showFilters = !showFilters)} class="btn secondary">
				{showFilters ? 'Hide' : 'Show'} Filters
			</button>
			<button onclick={printRequests} class="btn primary"> Print </button>
			<button onclick={emailRequests} class="btn primary"> Email </button>
		</div>
	</div>

	{#if showFilters}
		<div class="filters">
			<div class="filterGroup">
				<label for="startDate">Start Date</label>
				<input id="startDate" type="date" bind:value={startDate} class="input" />
			</div>
			<div class="filterGroup">
				<label for="endDate">End Date</label>
				<input id="endDate" type="date" bind:value={endDate} class="input" />
			</div>
			{#if userIsStaff}
				<div class="filterGroup checkboxGroup">
					<label class="checkboxLabel">
						<input type="checkbox" bind:checked={showStaffOnly} class="checkbox" />
						<span>Show Staff Only</span>
					</label>
				</div>
			{/if}
			<div class="quickFilters">
				<label>Quick Filters:</label>
				<div class="quickFilterButtons">
					<button onclick={() => setDateRange(7)} class="btn secondary small">1 Week</button>
					<button onclick={() => setDateRange(30)} class="btn secondary small">1 Month</button>
					<button onclick={() => setDateRange(90)} class="btn secondary small">3 Months</button>
					<button onclick={() => setDateRange(180)} class="btn secondary small">6 Months</button>
				</div>
			</div>
			<div class="filterActions">
				<button onclick={applyFilters} class="btn primary">Apply</button>
				<button onclick={clearFilters} class="btn secondary">Clear</button>
			</div>
		</div>
	{/if}

	{#if isLoading}
		<div class="loading">Loading prayer requests...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if requests.length === 0}
		<div class="empty">No prayer requests found.</div>
	{:else}
		<div class="requests">
			{#each requests as request (request.id)}
				<div class="requestCard">
					<div class="requestHeader">
						<span class="date">{formatDate(request.submittedAt)}</span>
						{#if request.isStaffOnly}
							<span class="staffBadge">Staff Only</span>
						{/if}
					</div>
					<div class="requestContent">
						<p class="requestText">{request.request}</p>
						{#if request.name}
							<p class="requestName">— {request.name}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.prayerList {
		margin: 0 auto;
		padding-block: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	h2 {
		color: var(--primaryColor);
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2rem);
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.btn.primary {
		background: oklch(0.2314 0.0756 264.052);
		color: white;
	}

	.btn.primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.btn.secondary {
		background: var(--inputBackground);
		color: var(--contrastColor);
		border: 1px solid var(--borderColor);
	}

	.btn.secondary:hover {
		background: var(--borderColor);
	}

	.btn.small {
		padding: 0.3rem 0.7rem;
		font-size: 0.8rem;
	}

	.filters {
		background: var(--cardBackground);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		align-items: end;
		border: 1px solid var(--borderColor);
	}

	.filterGroup {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filterGroup label {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--contrastColor);
	}

	.input {
		padding: 0.5rem;
		border: 1px solid var(--borderColor);
		border-radius: 4px;
		font-size: 0.9rem;
		background: var(--inputBackground);
		color: var(--contrastColor);
	}

	.checkboxGroup {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.checkboxLabel {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: normal;
	}

	.checkbox {
		width: 1rem;
		height: 1rem;
		accent-color: var(--primaryColor);
	}

	.quickFilters {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.quickFilters label {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--contrastColor);
	}

	.quickFilterButtons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.quickFilterButtons .btn {
		padding: 0.3rem 0.7rem;
		font-size: 0.8rem;
	}

	.filterActions {
		display: flex;
		gap: 0.5rem;
		grid-column: 1 / -1;
	}

	.loading,
	.error,
	.empty {
		text-align: center;
		padding: 3rem;
		color: var(--contrastColor);
		font-size: 1.1rem;
	}

	.error {
		color: #e53e3e;
	}

	.requests {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.requestCard {
		background: var(--backgroundColor);
		border: 1px solid var(--borderColor);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.requestCard:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
	}

	.requestHeader {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.date {
		font-size: 0.9rem;
		color: #64748b;
		font-weight: 500;
	}

	.staffBadge {
		background: #fef3c7;
		color: #92400e;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.requestContent {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.requestText {
		margin: 0;
		line-height: 1.6;
		color: var(--contrastColor);
		white-space: pre-wrap;
	}

	.requestName {
		margin: 0;
		font-style: italic;
		color: #64748b;
		font-size: 0.9rem;
	}

	@media print {
		.header,
		.filters,
		.actions {
			display: none !important;
		}

		.prayerList {
			padding: 0;
		}

		.requestCard {
			break-inside: avoid;
			box-shadow: none;
			border: 1px solid #000;
		}
	}

	@media (max-width: 640px) {
		.prayerList {
			padding: 1rem;
		}

		.header {
			flex-direction: column;
			align-items: stretch;
		}

		.actions {
			justify-content: center;
		}

		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
