// GitHub API request handler with caching

interface CacheData<T> {
	data: T;
	timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000;

export class RequestHandler {
	private static instance: RequestHandler;
	private cache: Map<string, CacheData<any>> = new Map();

	static getInstance(): RequestHandler {
		if (!RequestHandler.instance) {
			RequestHandler.instance = new RequestHandler();
		}
		return RequestHandler.instance;
	}

	async fetchWithCache<T>(
		url: string,
		cacheKey: string,
		options?: RequestInit
	): Promise<T> {
		const cached = this.cache.get(cacheKey);
		const now = Date.now();

		if (cached && now - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`);
		}

		const data = await response.json();

		// Store in cache
		this.cache.set(cacheKey, {
			data,
			timestamp: now,
		});

		return data;
	}

	async fetchGitHubRepos(username: string, token?: string): Promise<any[]> {
		const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`;

		const options: RequestInit = {};
		if (token) {
			options.headers = {
				Authorization: `token ${token}`,
			};
		}

		return this.fetchWithCache(url, `github_repos_${username}`, options);
	}

	async fetchGitHubUser(username: string, token?: string): Promise<any> {
		const url = `https://api.github.com/users/${username}`;

		const options: RequestInit = {};
		if (token) {
			options.headers = {
				Authorization: `token ${token}`,
			};
		}

		return this.fetchWithCache(url, `github_user_${username}`, options);
	}
}

export const requestHandler = RequestHandler.getInstance();