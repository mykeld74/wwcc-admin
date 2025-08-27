<script lang="ts">
	import { checkAuthStatus } from '$lib/auth';
	import { goto } from '$app/navigation';

	interface VolunteerOpportunity {
		id: number;
		name: string;
		email: string;
		phone: string | null;
		team: string;
		sendTo: string;
		department: string;
		message: string | null;
		addressed: boolean;
		submittedAt: string;
		updatedAt: string;
	}

	interface Stats {
		total: number;
		addressed: number;
		unaddressed: number;
		recent: number;
		teams: { [key: string]: number };
	}

	// Predefined teams array
	const TEAMS = [
		'Westwoods Kids',
		'Student Ministry',
		'Tech Team',
		'Connection Team',
		'Hospitality Team',
		'Women’s Ministry',
		'Greeter Team',
		'Set-Up and Tear-Down Team',
		'Prayer Team',
		'Worship Team',
		'Severe Weather Shelter Network',
		'Family Promise',
		'Administration Team'
	];

	let opportunities = $state<VolunteerOpportunity[]>([]);
	let stats = $state<Stats | null>(null);
	let isLoading = $state(true);
	let error = $state('');
	let currentUser = $state<any>(null);
	let searchTerm = $state('');
	let selectedDepartments = $state<Set<string>>(new Set());
	let showAddressed = $state<boolean | null>(null);
	let showFilters = $state(true);

	// Filtered opportunities based on search and filters
	let filteredOpportunities = $derived.by(() => {
		let filtered = opportunities;

		// Filter by search term
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase().trim();
			filtered = filtered.filter(
				(opp) =>
					opp.name.toLowerCase().includes(term) ||
					opp.email.toLowerCase().includes(term) ||
					opp.team.toLowerCase().includes(term) ||
					(opp.message && opp.message.toLowerCase().includes(term))
			);
		}

		// Filter by selected teams from predefined array, comparing with department field in DB
		if (selectedDepartments.size > 0) {
			filtered = filtered.filter((opp) => selectedDepartments.has(opp.department));
		}

		// Filter by addressed status
		if (showAddressed !== null) {
			filtered = filtered.filter((opp) => opp.addressed === showAddressed);
		}

		return filtered;
	});

	$effect(() => {
		checkAuth();
	});

	async function checkAuth() {
		try {
			const { user, isAuthenticated } = await checkAuthStatus();
			if (!isAuthenticated || !user) {
				await goto('/login');
				return;
			}

			if (user.role !== 'admin' && user.role !== 'staff') {
				await goto('/');
				return;
			}

			currentUser = user;
			await loadOpportunities();
			await loadStats();
		} catch (error) {
			console.error('Auth check failed:', error);
			await goto('/login');
		} finally {
			isLoading = false;
		}
	}

	async function loadOpportunities() {
		try {
			const params = new URLSearchParams();
			if (selectedDepartments.size > 0) {
				// Add all selected teams as separate department parameters
				selectedDepartments.forEach((team) => params.append('department', team));
			}
			if (showAddressed !== null) params.append('addressed', showAddressed.toString());

			const response = await fetch(`/api/volunteer-opportunities?${params}`);
			if (response.ok) {
				opportunities = await response.json();
			} else {
				error = 'Failed to load volunteer opportunities';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function loadStats() {
		try {
			const response = await fetch('/api/volunteer-opportunities?stats=true');
			if (response.ok) {
				stats = await response.json();
			}
		} catch (err) {
			console.error('Failed to load stats:', err);
		}
	}

	async function updateOpportunity(id: number, updates: Partial<VolunteerOpportunity>) {
		try {
			const response = await fetch(`/api/volunteer-opportunities/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updates)
			});

			if (response.ok) {
				await loadOpportunities();
				await loadStats();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to update opportunity';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function deleteOpportunity(id: number) {
		if (
			!confirm(
				'Are you sure you want to delete this volunteer opportunity? This action cannot be undone.'
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/volunteer-opportunities/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadOpportunities();
				await loadStats();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to delete opportunity';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function applyFilters() {
		await loadOpportunities();
	}

	function clearFilters() {
		selectedDepartments.clear();
		showAddressed = null;
		searchTerm = '';
		loadOpportunities();
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

	function toggleAddressed(id: number, currentStatus: boolean) {
		updateOpportunity(id, { addressed: !currentStatus });
	}
</script>

<svelte:head>
	<title>Volunteer Opportunities - Admin</title>
</svelte:head>

<div class="volunteerManagement">
	<div class="header">
		<h1>Volunteer Opportunities</h1>
		<p class="description">Manage volunteer opportunity submissions</p>
	</div>

	{#if stats}
		<div class="stats">
			<div class="statCard">
				<h3>Total</h3>
				<p class="statNumber">{stats.total}</p>
			</div>
			<div class="statCard">
				<h3>Addressed</h3>
				<p class="statNumber">{stats.addressed}</p>
			</div>
			<div class="statCard">
				<h3>Unaddressed</h3>
				<p class="statNumber">{stats.unaddressed}</p>
			</div>
			<div class="statCard">
				<h3>Recent (7 days)</h3>
				<p class="statNumber">{stats.recent}</p>
			</div>
		</div>
	{/if}

	{#if showFilters}
		<div class="filters">
			<div class="searchSection">
				<div class="searchContainer">
					<input
						type="text"
						placeholder="Search by name, email, team, or message..."
						bind:value={searchTerm}
						class="searchInput"
					/>
					{#if searchTerm}
						<button onclick={() => (searchTerm = '')} class="clearSearchBtn"> Clear </button>
					{/if}
				</div>
			</div>

			<div class="filterControls">
				<div class="filterGroup">
					<label>Teams:</label>
					<div class="teamCheckboxes">
						{#each TEAMS as team}
							<label class="checkboxLabel">
								<input
									type="checkbox"
									checked={selectedDepartments.has(team)}
									onchange={(e) => {
										const target = e.target as HTMLInputElement;
										if (target.checked) {
											selectedDepartments.add(team);
										} else {
											selectedDepartments.delete(team);
										}
									}}
									class="checkbox"
								/>
								<span>{team}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="filterGroup">
					<label for="statusFilter">Status:</label>
					<select id="statusFilter" bind:value={showAddressed} class="filterSelect">
						<option value={null}>All</option>
						<option value={false}>Unaddressed</option>
						<option value={true}>Addressed</option>
					</select>
				</div>

				<div class="filterActions">
					<button onclick={applyFilters} class="btn primary">Apply Filters</button>
					<button onclick={clearFilters} class="btn secondary">Clear All</button>
				</div>
			</div>

			<div class="searchResults">
				<p>Showing {filteredOpportunities.length} of {opportunities.length} opportunities</p>
			</div>
		</div>
	{/if}

	{#if isLoading}
		<div class="loading">Loading volunteer opportunities...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if filteredOpportunities.length === 0}
		<div class="empty">No volunteer opportunities found.</div>
	{:else}
		<div class="opportunitiesList">
			{#each filteredOpportunities as opportunity (opportunity.id)}
				<div class="opportunityCard {opportunity.addressed ? 'addressed' : ''}">
					<div class="opportunityHeader">
						<div class="opportunityInfo">
							<h3>{opportunity.name}</h3>
							<p class="email">{opportunity.email}</p>
							{#if opportunity.phone}
								<p class="phone">{opportunity.phone}</p>
							{/if}
							<p class="team">Team: <span class="teamBadge">{opportunity.team}</span></p>
							<p class="sendTo">Send to: {opportunity.sendTo}</p>
							<p class="date">Submitted: {formatDate(opportunity.submittedAt)}</p>
						</div>

						<div class="opportunityActions">
							<div class="statusToggle">
								<label class="toggleLabel">
									<input
										type="checkbox"
										checked={opportunity.addressed}
										onchange={() => toggleAddressed(opportunity.id, opportunity.addressed)}
										class="toggleInput"
									/>
									<span class="toggleSlider"></span>
									<span class="toggleText"
										>{opportunity.addressed ? 'Addressed' : 'Unaddressed'}</span
									>
								</label>
							</div>

							{#if currentUser?.role === 'admin'}
								<button class="deleteBtn" onclick={() => deleteOpportunity(opportunity.id)}>
									Delete
								</button>
							{/if}
						</div>
					</div>

					{#if opportunity.message}
						<div class="message">
							<h4>Message:</h4>
							<p>{opportunity.message}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.volunteerManagement {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		color: var(--primaryColor);
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
	}

	.description {
		color: var(--contrastColor);
		margin: 0;
		font-size: 1.1rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.statCard {
		background: var(--cardBackground);
		border: 1px solid var(--borderColor);
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
	}

	.statCard h3 {
		margin: 0 0 0.5rem 0;
		color: var(--contrastColor);
		font-size: 1rem;
	}

	.statNumber {
		margin: 0;
		font-size: 2rem;
		font-weight: bold;
		color: var(--primaryColor);
	}

	.filters {
		background: var(--cardBackground);
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		border: 1px solid var(--borderColor);
	}

	.searchSection {
		margin-bottom: 1.5rem;
	}

	.searchContainer {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.searchInput {
		padding: 0.75rem 1rem;
		border: 1px solid var(--borderColor);
		border-radius: 8px;
		background: var(--inputBackground);
		color: var(--contrastColor);
		font-size: 1rem;
		flex-grow: 1;
	}

	.searchInput:focus {
		outline: none;
		border-color: var(--primaryColor);
	}

	.clearSearchBtn {
		padding: 0.75rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clearSearchBtn:hover {
		background: #b91c1c;
		transform: translateY(-1px);
	}

	.filterControls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		align-items: end;
		margin-bottom: 1rem;
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

	.filterSelect {
		padding: 0.5rem;
		border: 1px solid var(--borderColor);
		border-radius: 4px;
		background: var(--inputBackground);
		color: var(--contrastColor);
		font-size: 0.9rem;
	}

	.teamCheckboxes {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
		padding: 0.5rem;
		border: 1px solid var(--borderColor);
		border-radius: 4px;
		background: var(--inputBackground);
	}

	.checkboxLabel {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--contrastColor);
	}

	.checkbox {
		width: 1rem;
		height: 1rem;
		accent-color: var(--primaryColor);
	}

	.filterActions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn.primary {
		background: var(--primaryColor);
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

	.searchResults p {
		color: var(--contrastColor);
		font-size: 0.9rem;
		margin: 0;
		text-align: center;
	}

	.loading,
	.error,
	.empty {
		text-align: center;
		padding: 3rem;
		font-size: 1.1rem;
		color: var(--contrastColor);
	}

	.error {
		color: #e53e3e;
	}

	.opportunitiesList {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.opportunityCard {
		background: var(--cardBackground);
		border: 1px solid var(--borderColor);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.opportunityCard.addressed {
		opacity: 0.7;
		border-left: 4px solid #059669;
	}

	.opportunityCard:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
	}

	.opportunityHeader {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		margin-bottom: 1rem;
	}

	.opportunityInfo h3 {
		margin: 0 0 0.5rem 0;
		color: var(--contrastColor);
		font-size: 1.2rem;
	}

	.email,
	.phone,
	.team,
	.sendTo,
	.date {
		margin: 0 0 0.5rem 0;
		color: #64748b;
		font-size: 0.9rem;
	}

	.teamBadge {
		background: #3b82f6;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.opportunityActions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-end;
	}

	.statusToggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.toggleLabel {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--contrastColor);
	}

	.toggleInput {
		display: none;
	}

	.toggleSlider {
		position: relative;
		width: 40px;
		height: 20px;
		background: #ccc;
		border-radius: 20px;
		transition: background 0.3s ease;
	}

	.toggleSlider:before {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: white;
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggleInput:checked + .toggleSlider {
		background: #059669;
	}

	.toggleInput:checked + .toggleSlider:before {
		transform: translateX(20px);
	}

	.deleteBtn {
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.deleteBtn:hover {
		background: #b91c1c;
		transform: translateY(-1px);
	}

	.message {
		border-top: 1px solid var(--borderColor);
		padding-top: 1rem;
		margin-top: 1rem;
	}

	.message h4 {
		margin: 0 0 0.5rem 0;
		color: var(--contrastColor);
		font-size: 1rem;
	}

	.message p {
		margin: 0;
		color: var(--contrastColor);
		line-height: 1.5;
		white-space: pre-wrap;
	}

	@media (max-width: 768px) {
		.volunteerManagement {
			padding: 1rem;
		}

		.opportunityHeader {
			flex-direction: column;
			align-items: stretch;
		}

		.opportunityActions {
			align-items: stretch;
		}

		.filterControls {
			grid-template-columns: 1fr;
		}

		.filterActions {
			justify-content: center;
		}
	}
</style>
