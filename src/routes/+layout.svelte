<script lang="ts">
	import '$lib/css/reset.css';
	import '$lib/css/styles.css';

	let { children } = $props();
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

<main>
	<header class="header">
		<div class="container">
			<h1>Westwoods Admin Page</h1>
			<nav class="nav">
				<a href="/" class="navLink">Home</a>
				{#if user}
					<a href="/requests" class="navLink">View Requests</a>
					{#if user.isStaff}
						<a href="/admin" class="navLink">Admin</a>
					{/if}
					<button onclick={logout} class="navLink logoutBtn">Logout</button>
				{:else}
					<a href="/login" class="navLink">Login</a>
					<a href="/register" class="navLink">Register</a>
				{/if}
				<a href="/test-google" class="navLink">Test OAuth</a>
			</nav>
		</div>
	</header>

	{@render children?.()}
</main>
