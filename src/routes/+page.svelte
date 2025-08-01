<script lang="ts">
	import { checkAuthStatus } from '$lib/auth';
	import { goto } from '$app/navigation';

	let user = $state<any>(null);
	let isLoading = $state(true);
	let stats = $state<any>(null);

	// Check authentication on mount
	$effect(() => {
		checkAuth();
	});

	async function checkAuth() {
		try {
			const { user: authUser } = await checkAuthStatus();
			user = authUser;

			if (!user.isStaff) {
				await goto('/');
				return;
			}

			await loadStats();
		} catch (error) {
			console.error('Auth check failed:', error);
			user = null;
		} finally {
			isLoading = false;
		}
	}

	async function loadStats() {
		try {
			const response = await fetch('/api/prayer-requests/stats');
			if (response.ok) {
				stats = await response.json();
			}
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	}
</script>

<svelte:head>
	<title>Admin - Westwoods Prayer Requests</title>
</svelte:head>

<div class="container">
	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else if user}
		<div class="content">
			<div class="adminHeader">
				<h2>Admin Dashboard</h2>
				<p>
					Welcome, {user.name}! You have {user.role === 'admin' ? 'administrative' : 'staff'} access
					to manage prayer requests.
				</p>
				<p class="userRole">
					Role: {user.role === 'admin'
						? 'Administrator'
						: user.role === 'staff'
							? 'Staff'
							: 'Prayer Partner'}
				</p>
			</div>

			{#if stats}
				<div class="statsGrid">
					<div class="statCard">
						<h3>Total Requests</h3>
						<div class="statNumber">{stats.total}</div>
					</div>
					<div class="statCard">
						<h3>Public Requests</h3>
						<div class="statNumber">{stats.public}</div>
					</div>
					<div class="statCard">
						<h3>Staff Only</h3>
						<div class="statNumber">{stats.staffOnly}</div>
					</div>
					<div class="statCard">
						<h3>Recent (7 days)</h3>
						<div class="statNumber">{stats.recent}</div>
					</div>
				</div>
			{/if}

			<div class="adminActions">
				<h3>Quick Actions</h3>
				<div class="actionButtons">
					<a href="/requests" class="actionBtn primary"> View Prayer Requests </a>
					<a href="/admin/users" class="actionBtn primary"> Manage Users </a>
				</div>
			</div>

			<div class="adminInfo">
				<h3>Admin Features</h3>
				<ul>
					<li>View all prayer requests including staff-only ones</li>
					<li>Filter requests by date range</li>
					<li>Print formatted prayer request lists</li>
					<li>Email prayer requests to congregation</li>
					<li>Manage user accounts and permissions</li>
				</ul>
			</div>
		</div>
	{/if}
</div>

<style>
	.adminHeader {
		text-align: center;
		margin-bottom: 3rem;
	}

	.adminHeader h2 {
		color: var(--primaryColor);
		margin-bottom: 0.5rem;
		font-size: 2rem;
	}

	.adminHeader p {
		color: var(--contrastColor);
		font-size: 1.1rem;
	}

	.userRole {
		color: var(--primaryColor) !important;
		font-weight: 600;
		font-size: 1rem;
		margin-top: 0.5rem;
	}

	.statsGrid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.statCard {
		background: var(--cardBackground);
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		text-align: center;
		border: 1px solid var(--borderColor);
	}

	.statCard h3 {
		color: var(--contrastColor);
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.statNumber {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--primaryColor);
	}

	.adminActions {
		background: var(--cardBackground);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		margin-bottom: 2rem;
		border: 1px solid var(--borderColor);
	}

	.adminActions h3 {
		color: var(--primaryColor);
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.actionButtons {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.actionBtn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.actionBtn.primary {
		background: linear-gradient(135deg, var(--primaryColor) 0%, var(--secondaryColor) 100%);
		color: white;
	}

	.actionBtn.primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.actionBtn.secondary {
		background: var(--inputBackground);
		color: var(--contrastColor);
		border: 1px solid var(--borderColor);
	}

	.actionBtn.secondary:hover {
		background: var(--borderColor);
	}

	.adminInfo {
		background: var(--cardBackground);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		border: 1px solid var(--borderColor);
	}

	.adminInfo h3 {
		color: var(--primaryColor);
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.adminInfo ul {
		list-style: none;
		padding: 0;
	}

	.adminInfo li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
		color: var(--contrastColor);
	}

	.adminInfo li:last-child {
		border-bottom: none;
	}

	.adminInfo li::before {
		content: '✓';
		color: var(--primaryColor);
		font-weight: bold;
		margin-right: 0.5rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		font-size: 1.2rem;
		color: var(--contrastColor);
	}

	@media (max-width: 640px) {
		.content {
			padding: 1rem 0;
		}

		.statsGrid {
			grid-template-columns: repeat(2, 1fr);
		}

		.actionButtons {
			flex-direction: column;
		}

		.adminActions,
		.adminInfo {
			padding: 1.5rem;
		}
	}
</style>
