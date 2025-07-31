<script lang="ts">
	import { browser } from '$app/environment';

	let googleClientId = $state('');
	let redirectUri = $state('');

	// Load Google OAuth config on mount
	$effect(() => {
		if (browser) {
			redirectUri = window.location.origin + '/api/auth/google/callback';

			fetch('/api/auth/google/config')
				.then((response) => response.json())
				.then((config) => {
					googleClientId = config.clientId || 'Not set';
				})
				.catch((error) => {
					googleClientId = 'Error loading config';
				});
		}
	});

	async function testGoogleOAuth() {
		try {
			const response = await fetch('/api/auth/google/config');
			const config = await response.json();

			if (!config.clientId) {
				alert('Google OAuth not configured');
				return;
			}

			const googleAuthUrl =
				`https://accounts.google.com/o/oauth2/v2/auth?` +
				`client_id=${encodeURIComponent(config.clientId)}&` +
				`redirect_uri=${encodeURIComponent(redirectUri)}&` +
				`response_type=code&` +
				`scope=${encodeURIComponent('openid email profile')}&` +
				`access_type=offline`;

			window.location.href = googleAuthUrl;
		} catch (error) {
			alert('Failed to load Google OAuth configuration');
		}
	}
</script>

<svelte:head>
	<title>Test Google OAuth - Westwoods Prayer Requests</title>
</svelte:head>

<div class="container">
	<div class="testContainer">
		<h2>Google OAuth Configuration Test</h2>

		<div class="configInfo">
			<p><strong>Google Client ID:</strong> {googleClientId}</p>
			<p><strong>Redirect URI:</strong> {redirectUri}</p>
		</div>

		<button onclick={testGoogleOAuth} class="testBtn"> Test Google OAuth </button>

		<div class="instructions">
			<h3>Setup Instructions:</h3>
			<ol>
				<li>
					Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
				</li>
				<li>Create a new project or select existing one</li>
				<li>Enable Google+ API</li>
				<li>Create OAuth 2.0 Client ID</li>
				<li>Set authorized redirect URI to: <code>{redirectUri}</code></li>
				<li>Add Client ID and Secret to your .env file</li>
			</ol>
		</div>
	</div>
</div>

<style>
	.testContainer {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--cardBackground);
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.configInfo {
		background: var(--inputBackground);
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.configInfo p {
		margin: 0.5rem 0;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.testBtn {
		background: linear-gradient(135deg, var(--primaryColor) 0%, var(--secondaryColor) 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 1rem 0;
	}

	.testBtn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.instructions {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--borderColor);
	}

	.instructions h3 {
		color: var(--primaryColor);
		margin-bottom: 1rem;
	}

	.instructions ol {
		padding-left: 1.5rem;
	}

	.instructions li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	.instructions code {
		background: var(--inputBackground);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.instructions a {
		color: var(--primaryColor);
		text-decoration: none;
	}

	.instructions a:hover {
		text-decoration: underline;
	}
</style>
