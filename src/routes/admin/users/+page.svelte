<script lang="ts">
	import { checkAuthStatus } from '$lib/auth';
	import { goto } from '$app/navigation';

	interface User {
		id: number;
		email: string;
		name: string | null;
		role: string;
		isStaff: boolean;
		createdAt: string;
		updatedAt: string;
	}

	let users = $state<User[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let currentUser = $state<any>(null);
	let searchTerm = $state('');

	// Filtered users based on search term
	let filteredUsers = $derived.by(() => {
		if (!searchTerm.trim()) {
			return users;
		}

		const term = searchTerm.toLowerCase().trim();
		return users.filter(
			(user) =>
				(user.name && user.name.toLowerCase().includes(term)) ||
				user.email.toLowerCase().includes(term)
		);
	});

	$effect(() => {
		checkAuth();
	});

	async function checkAuth() {
		try {
			const { user, isAuthenticated } = await checkAuthStatus();
			if (!isAuthenticated || !user) {
				await goto('/login');
				return;
			}

			if (user.role !== 'admin') {
				await goto('/');
				return;
			}

			currentUser = user;
			await loadUsers();
		} catch (error) {
			console.error('Auth check failed:', error);
			await goto('/login');
		} finally {
			isLoading = false;
		}
	}

	async function loadUsers() {
		try {
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				users = await response.json();
			} else {
				error = 'Failed to load users';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function updateUserRole(userId: number, newRole: string) {
		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ role: newRole })
			});

			if (response.ok) {
				await loadUsers(); // Reload the users list
			} else {
				const data = await response.json();
				error = data.error || 'Failed to update user role';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function deleteUser(userId: number) {
		if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadUsers(); // Reload the users list
			} else {
				const data = await response.json();
				error = data.error || 'Failed to delete user';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>User Management - Admin</title>
</svelte:head>

<div class="userManagement">
	<div class="header">
		<h1>User Management</h1>
		<p class="description">Manage user roles and permissions</p>
	</div>

	{#if isLoading}
		<div class="loading">Loading users...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="searchSection">
			<div class="searchContainer">
				<input
					type="text"
					placeholder="Search by name or email..."
					bind:value={searchTerm}
					class="searchInput"
				/>
				{#if searchTerm}
					<button onclick={() => (searchTerm = '')} class="clearSearchBtn"> Clear </button>
				{/if}
			</div>
			<div class="searchResults">
				<p>Showing {filteredUsers.length} of {users.length} users</p>
			</div>
		</div>

		<div class="usersList">
			{#each filteredUsers as user (user.id)}
				<div class="userCard">
					<div class="userInfo">
						<div class="userDetails">
							<h3>{user.name || 'No name'}</h3>
							<p class="email">{user.email}</p>
							<p class="role">Role: <span class="roleBadge {user.role}">{user.role}</span></p>
							<p class="date">Created: {formatDate(user.createdAt)}</p>
						</div>

						<div class="userActions">
							<div class="roleSelector">
								<label for="role-{user.id}">Change Role:</label>
								<select
									id="role-{user.id}"
									value={user.role}
									onchange={(e) => updateUserRole(user.id, (e.target as HTMLSelectElement).value)}
									disabled={user.id === currentUser?.id}
								>
									<option value="prayer_partner">Prayer Partner</option>
									<option value="staff">Staff</option>
									<option value="admin">Admin</option>
								</select>
							</div>

							{#if user.id !== currentUser?.id}
								<button class="deleteBtn" onclick={() => deleteUser(user.id)}> Delete User </button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.userManagement {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		color: var(--primaryColor);
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
	}

	.description {
		color: var(--contrastColor);
		margin: 0;
		font-size: 1.1rem;
	}

	.loading,
	.error {
		text-align: center;
		padding: 3rem;
		font-size: 1.1rem;
	}

	.error {
		color: #e53e3e;
	}

	.searchSection {
		margin-bottom: 2rem;
		text-align: center;
	}

	.searchContainer {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.searchInput {
		padding: 0.75rem 1rem;
		border: 1px solid var(--borderColor);
		border-radius: 8px;
		background: var(--inputBackground);
		color: var(--contrastColor);
		font-size: 1rem;
		flex-grow: 1;
	}

	.searchInput:focus {
		outline: none;
		border-color: var(--primaryColor);
	}

	.clearSearchBtn {
		padding: 0.75rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clearSearchBtn:hover {
		background: #b91c1c;
		transform: translateY(-1px);
	}

	.searchResults p {
		color: var(--contrastColor);
		font-size: 0.9rem;
		margin-top: 0.5rem;
	}

	.usersList {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.userCard {
		background: var(--cardBackground);
		border: 1px solid var(--borderColor);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.userInfo {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
	}

	.userDetails h3 {
		margin: 0 0 0.5rem 0;
		color: var(--contrastColor);
		font-size: 1.2rem;
	}

	.email {
		margin: 0 0 0.5rem 0;
		color: #64748b;
		font-size: 0.9rem;
	}

	.role {
		margin: 0 0 0.5rem 0;
		color: var(--contrastColor);
		font-size: 0.9rem;
	}

	.roleBadge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.roleBadge.admin {
		background: #dc2626;
		color: white;
	}

	.roleBadge.staff {
		background: #2563eb;
		color: white;
	}

	.roleBadge.prayer_partner {
		background: #059669;
		color: white;
	}

	.date {
		margin: 0;
		color: #64748b;
		font-size: 0.8rem;
	}

	.userActions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-end;
	}

	.roleSelector {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.roleSelector label {
		font-size: 0.9rem;
		color: var(--contrastColor);
		font-weight: 600;
	}

	.roleSelector select {
		padding: 0.5rem;
		border: 1px solid var(--borderColor);
		border-radius: 4px;
		background: var(--inputBackground);
		color: var(--contrastColor);
		font-size: 0.9rem;
	}

	.roleSelector select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.deleteBtn {
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.deleteBtn:hover {
		background: #b91c1c;
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.userManagement {
			padding: 1rem;
		}

		.userInfo {
			flex-direction: column;
			align-items: stretch;
		}

		.userActions {
			align-items: stretch;
		}

		.roleSelector {
			align-items: stretch;
		}
	}
</style>
