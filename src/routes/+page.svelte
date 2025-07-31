<script lang="ts">
	import PrayerRequestForm from '$lib/components/PrayerRequestForm.svelte';
</script>

<svelte:head>
	<title>Westwoods Prayer Requests</title>
	<meta name="description" content="Submit and view prayer requests for Westwoods Church" />
</svelte:head>

<div class="container">
	<div class="content">
		<div class="welcome">
			<h2>Welcome to Westwoods Prayer Requests</h2>
			<p>
				Share your prayer requests with our community. Your requests will be prayed for by our staff
				and congregation.
			</p>
		</div>

		<PrayerRequestForm />
	</div>
</div>

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

	@media (max-width: 640px) {
		.content {
			padding: 2rem 0;
		}
	}
</style>
