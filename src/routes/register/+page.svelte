<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let name = $state('');
	let role = $state('prayer_partner');
	let error = $state('');
	let loading = $state(false);

	// Check if user is already logged in
	$effect(() => {
		fetch('/api/auth/me')
			.then((res) => res.json())
			.then((data) => {
				if (data.user) {
					goto('/');
				}
			});
	});

	async function handleSubmit() {
		error = '';
		loading = true;

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			loading = false;
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			loading = false;
			return;
		}

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					name,
					role
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful, redirect to login
				goto('/login?message=Registration successful! Please log in.');
			} else {
				error = data.error || 'Registration failed';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Register - Prayer Requests</title>
</svelte:head>

<div class="registerContainer">
	<form class="registerForm" onsubmit={handleSubmit}>
		<h2>Create Account</h2>
		<p class="formDescription">Join our prayer community</p>

		<div class="form">
			<div class="formGroup">
				<label for="name">Full Name</label>
				<input
					id="name"
					type="text"
					class="input"
					bind:value={name}
					required
					placeholder="Enter your full name"
				/>
			</div>

			<div class="formGroup">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					class="input"
					bind:value={email}
					required
					placeholder="Enter your email"
				/>
			</div>

			<div class="formGroup">
				<label for="role">Role</label>
				<select id="role" class="input" bind:value={role} required>
					<option value="prayer_partner">Prayer Partner</option>
					<option value="staff">Staff</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			<div class="formGroup">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					class="input"
					bind:value={password}
					required
					placeholder="Enter your password"
					minlength="6"
				/>
			</div>

			<div class="formGroup">
				<label for="confirmPassword">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					class="input"
					bind:value={confirmPassword}
					required
					placeholder="Confirm your password"
					minlength="6"
				/>
			</div>

			{#if error}
				<div class="errorMessage">{error}</div>
			{/if}

			<button type="submit" class="submitBtn" disabled={loading}>
				{loading ? 'Creating Account...' : 'Create Account'}
			</button>
		</div>

		<div class="loginLink">
			Already have an account? <a href="/login">Log in here</a>
		</div>
	</form>
</div>

<style>
	.registerContainer {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem 0;
	}

	.registerForm {
		background: var(--cardBackground);
		padding: 2.5rem;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid var(--borderColor);
		width: 100%;
		max-width: 500px;
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
		margin-top: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.submitBtn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	.submitBtn:disabled {
		opacity: 0.7;
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

	.loginLink {
		text-align: center;
		margin-top: 1.5rem;
		color: var(--textMuted);
		font-size: 0.9rem;
	}

	.loginLink a {
		color: var(--primaryColor);
		text-decoration: none;
		font-weight: 600;
	}

	.loginLink a:hover {
		text-decoration: underline;
	}
</style>
