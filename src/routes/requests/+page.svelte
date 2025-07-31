<script lang="ts">
	import PrayerRequestList from '$lib/components/PrayerRequestList.svelte';
	import { goto } from '$app/navigation';

	let user = $state<any>(null);
	let isLoading = $state(true);

	// Check authentication on mount
	$effect(() => {
		checkAuth();
	});

	async function checkAuth() {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			} else {
				// Redirect to login if not authenticated
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

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			await goto('/');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}

	// $inspect rune (Svelte 5 feature)
	$inspect(user);
</script>

<svelte:head>
	<title>Prayer Requests - Westwoods</title>
</svelte:head>

<div class="container">
	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else if user}
		<div class="content">
			<div class="userInfo">
				<h3>Welcome, {user.name}!</h3>
				<p>Email: {user.email}</p>
				<p>
					Role: {user.role === 'admin'
						? 'Administrator'
						: user.role === 'staff'
							? 'Staff'
							: 'Prayer Partner'}
				</p>
				<p class="accessInfo">
					{#if user.isStaff}
						You have access to view all prayer requests including staff-only requests.
					{:else}
						You can view public prayer requests.
					{/if}
				</p>
			</div>
			<PrayerRequestList />
		</div>
	{/if}
</div>

<style>
	.userInfo {
		background: #0a1a40;
		padding: 1.5rem;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.userInfo h3 {
		color: white;
		margin-bottom: 0.5rem;
		font-size: 1.25rem;
	}

	.userInfo p {
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.25rem;
	}

	.accessInfo {
		margin-top: 0.75rem !important;
		font-style: italic;
		color: rgba(255, 255, 255, 0.8) !important;
	}

	.userInfo p {
		margin: 0;
		color: var(--contrastColor);
		font-weight: 500;
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
	}
</style>
