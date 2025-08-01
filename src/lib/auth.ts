// Client-side auth utility
export async function checkAuthStatus(): Promise<{ user: any; isAuthenticated: boolean }> {
	try {
		const response = await fetch('/api/auth/me');
		if (response.ok) {
			const data = await response.json();
			return { user: data.user, isAuthenticated: true };
		} else {
			return { user: null, isAuthenticated: false };
		}
	} catch (error) {
		console.error('Auth check failed:', error);
		return { user: null, isAuthenticated: false };
	}
}
