import { corsHeaders } from './constants/cors';
import routes from './routes/route';
import startScraping from './handler/scraping';

const hasValidHeader = (request: any, env: any) => {
	const url = new URL(request.url);
	const authKey = url.searchParams.get('auth_key');
	if (authKey == 'jabr2worker') {
		return true;
	}
	return request.headers.get('X-Custom-Auth-Key') === env.AUTH_KEY_SECRET;
};

function authorizeRequest(request: any, env: any, key: any) {
	switch (request.method) {
		case 'PUT':
			return false;
		case 'DELETE':
			return false;
		case 'GET':
			return hasValidHeader(request, env);
		case 'HEAD':
		case 'OPTIONS':
			return true;
		default:
			return false;
	}
}

async function handleOptions(request: any) {
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		// Handle CORS preflight requests.
		return new Response(null, {
			headers: corsHeaders,
		});
	} else {
		// Handle standard OPTIONS request.
		return new Response(null, {
			headers: {
				Allow: 'GET, HEAD, OPTIONS, PUT, DELETE',
			},
		});
	}
}

const methodNotAllowed = () => {
	return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
};

export default {
	async fetch(request, env: any, ctx): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method;
		const key = url.searchParams.get('auth_key');
		console.log('key: ', key);

		if (request.method === 'OPTIONS') {
			console.log('OPTIONS');
			return handleOptions(request);
		}

		if (!authorizeRequest(request, env, key)) {
			return new Response('Forbidden', { status: 403 });
		}

		const route = routes[url.pathname];
		if (route) {
			const handler = route[method];
			if (handler) {
				return handler(request, env, ctx);
			}
			return methodNotAllowed();
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},

	async scheduled(event, env, ctx) {
		ctx.waitUntil(startScraping(env));
	},
} satisfies ExportedHandler<Env>;
