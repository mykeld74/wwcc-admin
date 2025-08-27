<script lang="ts">
	import { goto } from '$app/navigation';
	import { checkAuthStatus } from '$lib/auth';
	import '$lib/css/reset.css';
	import '$lib/css/styles.css';

	let { children } = $props();
	let user = $state<any>(null);
	let isLoading = $state(true);

	// Check authentication on mount
	$effect(() => {
		checkAuth();
	});

	// Listen for login success events
	$effect(() => {
		if (typeof window !== 'undefined') {
			const handleLoginSuccess = () => {
				setTimeout(checkAuth, 100);
			};

			window.addEventListener('login-success', handleLoginSuccess);

			return () => {
				window.removeEventListener('login-success', handleLoginSuccess);
			};
		}
	});

	// Listen for storage events (for cross-tab auth changes)
	$effect(() => {
		if (typeof window !== 'undefined') {
			const handleStorageChange = () => {
				checkAuth();
			};

			window.addEventListener('storage', handleStorageChange);

			// Also check auth when the page becomes visible
			const handleVisibilityChange = () => {
				if (!document.hidden) {
					checkAuth();
				}
			};

			document.addEventListener('visibilitychange', handleVisibilityChange);

			return () => {
				window.removeEventListener('storage', handleStorageChange);
				document.removeEventListener('visibilitychange', handleVisibilityChange);
			};
		}
	});

	async function checkAuth() {
		const { user: authUser } = await checkAuthStatus();
		user = authUser;
		isLoading = false;
	}

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			user = null;
			isLoading = false;
			await goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<main>
	<header class="header">
		<div class="container">
			<h1>Westwoods Admin Page</h1>
			<nav class="nav">
				{#if user && (user.role === 'admin' || user.role === 'staff')}
					<a href="/" class="navLink">Home</a>
					<a href="/requests" class="navLink">View Requests</a>
					<a href="/admin/volunteer-opportunities" class="navLink">Volunteer Opportunities</a>
				{/if}
				{#if user && user.role === 'admin'}
					<a href="/admin/users" class="navLink">Manage Users</a>
				{/if}
				{#if user}
					<button onclick={logout} class="navLink logoutBtn">Logout</button>
				{:else}
					<a href="/login" class="navLink">Login</a>
					<a href="/register" class="navLink">Register</a>
				{/if}
			</nav>
		</div>
	</header>

	{@render children?.()}
</main>
