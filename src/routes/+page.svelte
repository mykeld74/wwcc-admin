<script lang="ts">
	import PrayerRequestForm from '$lib/components/PrayerRequestForm.svelte';
	import { onMount } from 'svelte';

	let user: any = null;
	let isLoading = true;

	onMount(async () => {
		await checkAuth();
	});

	async function checkAuth() {
		try {
			const response = await fetch('/api/auth/me');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			}
		} catch (error) {
			console.error('Auth check failed:', error);
		} finally {
			isLoading = false;
		}
	}

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			user = null;
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<svelte:head>
	<title>Westwoods Prayer Requests</title>
	<meta name="description" content="Submit and view prayer requests for Westwoods Church" />
</svelte:head>

<main>
	<header class="header">
		<div class="container">
			<h1>Westwoods Prayer Requests</h1>
			<nav class="nav">
				{#if user}
					<a href="/requests" class="navLink">View Requests</a>
					{#if user.isStaff}
						<a href="/admin" class="navLink">Admin</a>
					{/if}
					<button on:click={logout} class="navLink logoutBtn">Logout</button>
				{:else}
					<a href="/login" class="navLink">Login</a>
					<a href="/register" class="navLink">Register</a>
				{/if}
			</nav>
		</div>
	</header>

	<div class="container">
		{#if isLoading}
			<div class="loading">Loading...</div>
		{:else}
			<div class="content">
				<div class="welcome">
					<h2>Welcome to Westwoods Prayer Requests</h2>
					<p>
						Share your prayer requests with our community. Your requests will be prayed for by our
						staff and congregation.
					</p>
					{#if user}
						<p class="userInfo">
							Welcome back, {user.name}!
							{#if user.isStaff}
								You have staff access to view all prayer requests.
							{:else}
								You can view public prayer requests.
							{/if}
						</p>
					{:else}
						<p class="loginPrompt">
							<a href="/login">Login</a> to view prayer requests and manage your account.
						</p>
					{/if}
				</div>

				<PrayerRequestForm />
			</div>
		{/if}
	</div>
</main>

<style>
	.content {
		padding: 3rem 0;
	}

	.welcome {
		text-align: center;
		margin-bottom: 4rem;
		margin-left: auto;
		margin-right: auto;
		padding: 2rem;
		background: var(--cardBackground);
		border-radius: 12px;
		border: 1px solid var(--borderColor);
	}

	.welcome h2 {
		color: var(--primaryColor);
		margin-bottom: 1.5rem;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
	}

	.welcome p {
		margin-bottom: 1.5rem;
		font-size: 1.125rem;
		color: var(--contrastColor);
		line-height: 1.7;
	}

	.userInfo {
		background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
		padding: 1.5rem;
		border-radius: 12px;
		border-left: 4px solid var(--primaryColor);
		margin-top: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.loginPrompt {
		background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
		padding: 1.5rem;
		border-radius: 12px;
		border-left: 4px solid var(--accentColor);
		margin-top: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.loginPrompt a {
		color: var(--primaryColor);
		text-decoration: none;
		font-weight: 600;
	}

	.loginPrompt a:hover {
		text-decoration: underline;
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
			padding: 2rem 0;
		}
	}
</style>
