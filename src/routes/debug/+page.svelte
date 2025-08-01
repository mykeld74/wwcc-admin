<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuthStatus } from '$lib/auth';

	let envInfo = {};
	let googleConfig = {};
	let user = $state<any>(null);
	let isLoading = $state(true);
	let error = $state('');

	onMount(async () => {
		// Check environment variables
		try {
			const envResponse = await fetch('/api/debug/env');
			envInfo = await envResponse.json();
		} catch (error) {
			console.error('Failed to fetch env info:', error);
		}

		// Check Google config
		try {
			const configResponse = await fetch('/api/auth/google/config');
			googleConfig = await configResponse.json();
		} catch (error) {
			console.error('Failed to fetch Google config:', error);
		}

		// Check auth status
		try {
			const { user: authUser } = await checkAuthStatus();
			user = authUser;
		} catch (error) {
			console.error('Auth check failed:', error);
			user = null;
		} finally {
			isLoading = false;
		}
	});

	async function checkAuth() {
		try {
			const { user: authUser } = await checkAuthStatus();
			user = authUser;
		} catch (error) {
			console.error('Auth check failed:', error);
			user = null;
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Debug - Westwoods Prayer Requests</title>
</svelte:head>

<main>
	<header class="header">
		<div class="container">
			<h1>Debug Information</h1>
			<nav class="nav">
				<a href="/" class="navLink">Home</a>
				<a href="/test-google" class="navLink">Test Google OAuth</a>
			</nav>
		</div>
	</header>

	<div class="container">
		<div class="debugContainer">
			<h2>Environment Variables</h2>
			<pre>{JSON.stringify(envInfo, null, 2)}</pre>

			<h2>Google OAuth Configuration</h2>
			<pre>{JSON.stringify(googleConfig, null, 2)}</pre>

			<h2>Authentication Status</h2>
			<p>{user ? `Authenticated as: ${user.email}` : 'Not authenticated'}</p>

			<h2>Quick Actions</h2>
			<div class="actions">
				<a href="/test-google" class="btn">Test Google OAuth</a>
				<a href="/login" class="btn">Go to Login</a>
				<a href="/api/auth/me" class="btn" target="_blank">Check Auth API</a>
			</div>
		</div>
	</div>
</main>

<style>
	.debugContainer {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--cardBackground);
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.debugContainer h2 {
		color: var(--primaryColor);
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.debugContainer h2:first-child {
		margin-top: 0;
	}

	pre {
		background: var(--inputBackground);
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		font-family: monospace;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		background: linear-gradient(135deg, var(--primaryColor) 0%, var(--secondaryColor) 100%);
		color: white;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
</style>
