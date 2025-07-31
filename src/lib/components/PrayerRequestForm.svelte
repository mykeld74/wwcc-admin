<script lang="ts">
	let request = $state('');
	let name = $state('');
	let email = $state('');
	let isStaffOnly = $state(false);
	let isSubmitting = $state(false);
	let submitMessage = $state('');
	let submitError = $state('');

	async function handleSubmit() {
		if (!request.trim()) {
			submitError = 'Please enter your prayer request.';
			return;
		}

		isSubmitting = true;
		submitError = '';
		submitMessage = '';

		try {
			const response = await fetch('/api/prayer-requests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					request: request.trim(),
					name: name.trim() || undefined,
					email: email.trim() || undefined,
					isStaffOnly
				})
			});

			if (response.ok) {
				submitMessage = 'Your prayer request has been submitted successfully.';
				// Reset form
				request = '';
				name = '';
				email = '';
				isStaffOnly = false;
			} else {
				const error = await response.json();
				submitError = error.message || 'Failed to submit prayer request.';
			}
		} catch (error) {
			submitError = 'Network error. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="prayerForm">
	<h2>Westwoods Prayer Request</h2>
	<p class="formDescription">Write out your prayer request below.</p>

	<form onsubmit={handleSubmit} class="form">
		<div class="formGroup">
			<label for="request" class="required"> How can we join you in prayer? </label>
			<textarea
				id="request"
				bind:value={request}
				placeholder="Please share your prayer request..."
				required
				rows="6"
				class="textarea"
			></textarea>
		</div>

		<div class="formGroup">
			<label for="name">Name</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				placeholder="Your name (optional)"
				class="input"
			/>
		</div>

		<div class="formGroup">
			<label for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="Your email (optional)"
				class="input"
			/>
		</div>

		<div class="formGroup checkboxGroup">
			<label class="checkboxLabel">
				<input type="checkbox" bind:checked={isStaffOnly} class="checkbox" />
				<span class="checkboxText">Mark if for staff only</span>
			</label>
		</div>

		{#if submitError}
			<div class="errorMessage">{submitError}</div>
		{/if}

		{#if submitMessage}
			<div class="successMessage">{submitMessage}</div>
		{/if}

		<button type="submit" disabled={isSubmitting} class="submitBtn">
			{isSubmitting ? 'Submitting...' : 'Submit'}
		</button>
	</form>
</div>

<style>
	.prayerForm {
		margin: 0 auto;
		padding: 2.5rem;
		background: var(--cardBackground);
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid var(--borderColor);
	}

	h2 {
		color: var(--primaryColor);
		margin: 0 0 1rem 0;
		font-size: clamp(1.75rem, 4vw, 2.25rem);
		text-align: center;
		font-weight: 700;
	}

	.formDescription {
		text-align: center;
		color: var(--contrastColor);
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.formGroup {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: var(--contrastColor);
		font-size: 1rem;
	}

	.required::after {
		content: ' *';
		color: #e53e3e;
	}

	.input,
	.textarea {
		padding: 1rem;
		border: 2px solid var(--borderColor);
		border-radius: 12px;
		font-size: 1rem;
		background: var(--inputBackground);
		color: var(--contrastColor);
		transition: all 0.3s ease;
		font-family: inherit;
		width: 100%;
	}

	.input:focus,
	.textarea:focus {
		outline: none;
		border-color: var(--secondaryColor);
		box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
		transform: translateY(-1px);
	}

	.textarea {
		resize: vertical;
		min-height: 120px;
	}

	.checkboxGroup {
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
	}

	.checkboxLabel {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: normal;
	}

	.checkbox {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: var(--primaryColor);
	}

	.checkboxText {
		font-size: 1rem;
	}

	.submitBtn {
		background: linear-gradient(135deg, var(--primaryColor) 0%, var(--secondaryColor) 100%);
		color: white;
		border: none;
		padding: 1.25rem 2.5rem;
		border-radius: 12px;
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 1.5rem;
		width: 100%;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.submitBtn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
	}

	.submitBtn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.errorMessage {
		background: #fed7d7;
		color: #c53030;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #feb2b2;
		font-size: 0.9rem;
	}

	.successMessage {
		background: #c6f6d5;
		color: #2f855a;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #9ae6b4;
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.prayerForm {
			padding: 1.5rem;
			margin: 1rem;
		}

		.form {
			gap: 1rem;
		}
	}
</style>
