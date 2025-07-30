<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let isLoading = true;
	let stats: any = null;

	onMount(async () => {
		await checkAuth();
	});

	async function checkAuth() {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;

				if (!user.isStaff) {
					await goto('/');
					return;
				}

				await loadStats();
			} else {
				await goto('/login');
				return;
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			await goto('/login');
			return;
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

	async function emailRequests() {
		try {
			const response = await fetch('/api/prayer-requests/email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					includeStaffOnly: true
				})
			});

			if (response.ok) {
				const result = await response.json();
				alert(
					`Prayer requests emailed successfully! Sent ${result.count} requests to ${result.recipients} recipients.`
				);
			} else {
				const error = await response.json();
				alert(`Failed to email prayer requests: ${error.error}`);
			}
		} catch (error) {
			alert('Network error. Please try again.');
		}
	}

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			await goto('/');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<svelte:head>
	<title>Admin - Westwoods Prayer Requests</title>
</svelte:head>

<main>
	<header class="header">
		<div class="container">
			<h1>Westwoods Prayer Requests</h1>
			<nav class="nav">
				<a href="/" class="navLink">Home</a>
				<a href="/requests" class="navLink">View Requests</a>
				<button on:click={logout} class="navLink logoutBtn">Logout</button>
			</nav>
		</div>
	</header>

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
						<a href="/requests" class="actionBtn primary"> View All Requests </a>
						<button class="actionBtn secondary" on:click={() => window.print()}>
							Print All Requests
						</button>
						<button class="actionBtn secondary" on:click={emailRequests}> Email Requests </button>
						<button class="actionBtn secondary"> Export Data </button>
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
</main>

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
		.header .container {
			flex-direction: column;
			gap: 1rem;
		}

		.nav {
			flex-wrap: wrap;
			justify-content: center;
		}

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
