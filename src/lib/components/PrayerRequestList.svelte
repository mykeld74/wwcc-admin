<script lang="ts">
	import { onMount } from 'svelte';

	interface PrayerRequest {
		id: number;
		request: string;
		name: string | null;
		email: string | null;
		isStaffOnly: boolean;
		submittedAt: string;
		updatedAt: string;
	}

	let requests: PrayerRequest[] = [];
	let isLoading = true;
	let error = '';
	let userIsStaff = false;

	// Filters
	let startDate = '';
	let endDate = '';
	let showPublicOnly = false;
	let showFilters = false;

	// Print state
	let isPrinting = false;

	onMount(async () => {
		await loadRequests();
		await checkUserPermissions();
	});

	async function checkUserPermissions() {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const user = await response.json();
				userIsStaff = user.isStaff;
			}
		} catch (error) {
			console.error('Failed to check user permissions:', error);
		}
	}

	async function loadRequests() {
		isLoading = true;
		error = '';

		try {
			const params = new URLSearchParams();
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);
			if (showPublicOnly) params.append('includeStaffOnly', 'false');

			console.log(
				'Frontend Debug - Params:',
				params.toString(),
				'UserIsStaff:',
				userIsStaff,
				'ShowPublicOnly:',
				showPublicOnly
			);

			const response = await fetch(`/api/prayer-requests?${params}`);

			if (response.ok) {
				requests = await response.json();
				console.log('Frontend Debug - Received requests:', requests.length);
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
		showPublicOnly = false;
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
					includeStaffOnly: !showPublicOnly
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
			<button on:click={() => (showFilters = !showFilters)} class="btn secondary">
				{showFilters ? 'Hide' : 'Show'} Filters
			</button>
			<button on:click={printRequests} class="btn primary"> Print </button>
			<button on:click={emailRequests} class="btn primary"> Email </button>
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
						<input type="checkbox" bind:checked={showPublicOnly} class="checkbox" />
						<span>Show Public Only</span>
					</label>
				</div>
			{/if}
			<div class="filterActions">
				<button on:click={applyFilters} class="btn primary">Apply</button>
				<button on:click={clearFilters} class="btn secondary">Clear</button>
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
