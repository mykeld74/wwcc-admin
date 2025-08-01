<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { checkAuthStatus } from '$lib/auth';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Check for URL parameters on mount
	$effect(() => {
		if (browser) {
			const urlParams = new URLSearchParams(window.location.search);
			const message = urlParams.get('message');
			const errorParam = urlParams.get('error');

			if (message) {
				successMessage = message;
			}

			if (errorParam) {
				error = decodeURIComponent(errorParam);
			}
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!email || !password) {
			error = 'Please enter both email and password.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				console.log('Login successful', response);

				// Check user role to determine redirect
				const { user } = await checkAuthStatus();
				if (user) {
					const userRole = user.role;

					// Dispatch login success event
					if (typeof window !== 'undefined') {
						window.dispatchEvent(new CustomEvent('login-success'));
					}

					if (userRole === 'prayer_partner') {
						await goto('/requests');
					} else {
						await goto('/');
					}
				} else {
					// Fallback to home page if user info can't be retrieved
					await goto('/');
				}
			} else {
				const data = await response.json();
				error = data.error || 'Login failed.';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleLogin() {
		isLoading = true;
		error = '';
		successMessage = '';

		try {
			// Get Google Client ID from server
			const response = await fetch('/api/auth/google/config');
			const config = await response.json();

			if (!config.clientId) {
				error = 'Google OAuth not configured';
				isLoading = false;
				return;
			}

			// Redirect to Google OAuth
			const googleAuthUrl =
				`https://accounts.google.com/o/oauth2/v2/auth?` +
				`client_id=${encodeURIComponent(config.clientId)}&` +
				`redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&` +
				`response_type=code&` +
				`scope=${encodeURIComponent('openid email profile')}&` +
				`access_type=offline`;

			window.location.href = googleAuthUrl;
		} catch (err) {
			console.error('Google login error:', err);
			error = 'Google login failed. Please try again.';
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Westwoods Prayer Requests</title>
</svelte:head>

<div class="container">
	<div class="loginContainer">
		<div class="loginForm">
			<h2>Login</h2>
			<p class="formDescription">Sign in to view prayer requests and manage your account.</p>

			<form onsubmit={handleSubmit} class="form">
				<div class="formGroup">
					<label for="email">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Enter your email"
						required
						class="input"
					/>
				</div>

				<div class="formGroup">
					<label for="password">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Enter your password"
						required
						class="input"
					/>
				</div>

				{#if error}
					<div class="errorMessage">{error}</div>
				{/if}

				<button type="submit" disabled={isLoading} class="submitBtn">
					{isLoading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<div class="divider">
				<span>or</span>
			</div>

			<button onclick={handleGoogleLogin} class="googleBtn" disabled={isLoading}>
				<svg class="googleIcon" viewBox="0 0 24 24">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Sign in with Google
			</button>

			{#if successMessage}
				<div class="successMessage">{successMessage}</div>
			{/if}

			<div class="formFooter">
				<p>Don't have an account? <a href="/register">Create one here</a></p>
			</div>
		</div>
	</div>
</div>

<style>
	.loginContainer {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 80px);
		padding: 2rem 0;
	}

	.loginForm {
		background: var(--cardBackground);
		padding: 2.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid var(--borderColor);
		width: 100%;
		max-width: 450px;
	}

	.formDescription {
		text-align: center;
		color: var(--contrastColor);
		margin-bottom: 2rem;
		font-size: 1rem;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.submitBtn {
		padding: 1.25rem 2.5rem;
		border-radius: 12px;
		font-size: 1.125rem;
		transition: all 0.3s ease;
		margin-top: 1.5rem;
		width: 100%;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.submitBtn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	}

	.submitBtn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.errorMessage {
		background: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid rgba(239, 68, 68, 0.3);
		font-size: 0.9rem;
	}

	.successMessage {
		background: rgba(34, 197, 94, 0.1);
		color: #86efac;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid rgba(34, 197, 94, 0.3);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.formFooter {
		margin-top: 2rem;
		text-align: center;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.formFooter p {
		color: var(--textMuted);
		font-size: 0.9rem;
	}

	.formFooter a {
		color: var(--primaryColor);
		text-decoration: none;
		font-weight: 600;
	}

	.formFooter a:hover {
		text-decoration: underline;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 1.5rem 0;
		color: var(--textMuted);
		font-size: 0.9rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--borderColor);
	}

	.divider span {
		padding: 0 1rem;
	}

	.googleBtn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--borderColor);
		border-radius: 8px;
		background: white;
		color: #333;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.googleBtn:hover:not(:disabled) {
		background: #f8f9fa;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.googleBtn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.googleIcon {
		width: 18px;
		height: 18px;
	}

	@media (max-width: 640px) {
		.loginContainer {
			padding: 1rem 0;
		}

		.loginForm {
			padding: 2rem;
			margin: 1rem;
		}
	}
</style>
