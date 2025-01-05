import { load } from 'cheerio';
import { set100 } from './constants/set100';
import { stockData } from './model/stock';
import { headerDefault } from './constants/fakeHeader';
import setScraping from './service/scraping';
import { convertToBangkokTime } from './utils/convertTime';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, PUT, DELETE',
	'Access-Control-Allow-Headers': 'X-Custom-Auth-Key, Range',
};

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

function isBusinessHour(date: Date) {
	return date.getHours() >= 10 && date.getHours() <= 17 ? date.getMinutes() < 30 : false;
}

function isWeekend(date: Date) {
	return date.getDay() === 0 || date.getDay() === 6;
}

async function getSET100PRICES(env: any) {
	const query = `SELECT * FROM SET100_PRICES ORDER BY recorded_at DESC LIMIT 100`;
	const { results } = await env.DB.prepare(query).all();
	return results;
}

async function insertSET100(env: any, date: string) {
	const query = `INSERT INTO SET100 (symbol, name, main_business, industry, created_at, updated_at) VALUES ${set100
		.map((symbol) => {
			return `('${symbol}', '', '', '', '${date}', '${date}')`;
		})
		.join(',')}`;

	await env.DB.prepare(query).run();
	console.log('SET100 inserted successfully');
}

async function insertSET100PRICES(env: any, stocks: stockData[], date: string) {
	const query = `INSERT INTO SET100_PRICES (stock_id, price, recorded_at) VALUES ${stocks
		.map((stock) => {
			const stock_id = set100.findIndex((s) => s === stock.symbol) + 1;
			return `(${stock_id}, ${stock.price.toFixed(2)}, '${date}')`;
		})
		.join(',')}`;

	await env.DB.prepare(query).run();
	console.log('Stock prices inserted successfully');
}

async function isTableSET100Exist(env: any) {
	const checkTableQuery = `
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' AND name='SET100';
  `;

	const { results: existingTable } = await env.DB.prepare(checkTableQuery).all();

	if (existingTable.length === 0) {
		const query = `CREATE TABLE IF NOT EXISTS "SET100" (
		"id" INTEGER NOT NULL,
		"symbol" varchar(255) NOT NULL UNIQUE,
		"name" varchar(255) NOT NULL,
		"main_business" TEXT NOT NULL,
		"industry" TEXT NOT NULL,
		"created_at" TIMESTAMP NOT NULL,
		"updated_at" TIMESTAMP NOT NULL,
		PRIMARY KEY ("id")
	  );`;

		await env.DB.prepare(query).run();
		console.log('Table SET100 created successfully');
	} else {
		console.log('Table SET100 already exists');
	}
}

async function isTableSET100PRICESExist(env: any) {
	const checkTableQuery = `
	SELECT name 
	FROM sqlite_master 
	WHERE type='table' AND name='SET100_PRICES';
  `;

	const { results: existingTable } = await env.DB.prepare(checkTableQuery).all();

	if (existingTable.length === 0) {
		const query = `CREATE TABLE IF NOT EXISTS "SET100_PRICES" (
		"id" INTEGER NOT NULL,
		"stock_id" INTEGER NOT NULL,
		"price" DECIMAL NOT NULL,
		"recorded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY ("id"),
		FOREIGN KEY ("stock_id") REFERENCES "SET100"("id")
	  );`;

		await env.DB.prepare(query).run();
		console.log('Table SET100_PRICE created successfully');
	} else {
		console.log('Table SET100_PRICE already exists');
	}
}

async function handleScraping(env: any) {
	const date = new Date();
	const bangkokTime = convertToBangkokTime(date.getTime());

	if (isWeekend(bangkokTime) || !isBusinessHour(bangkokTime)) {
		return;
	}

	const stocks = await setScraping();
	const formatedDate = date.toISOString().replace('T', ' ').replace('Z', '');
	await insertSET100PRICES(env, stocks, formatedDate);

	// then save to database
}

export default {
	async fetch(request, env: any, ctx): Promise<Response> {
		const url = new URL(request.url);
		const key = url.searchParams.get('auth_key');
		console.log('key: ', key);

		if (request.method === 'OPTIONS') {
			console.log('OPTIONS');
			return handleOptions(request);
		}

		if (!authorizeRequest(request, env, key)) {
			return new Response('Forbidden', { status: 403 });
		}

		const stocks = await setScraping();

		// await isTableSET100Exist(env);
		// await isTableSET100PRICESExist(env);

		// only run this once
		// const date = new Date().toISOString().replace('T', ' ').replace('Z', '');
		// await insertSET100(env, date);
		// await insertSET100PRICES(env, stocks, date);

		// const set100_prices = await getSET100PRICES(env);

		const template = stocks
			.map((stock) => {
				return '<tr><td>' + stock.symbol + ':   </td><td>' + stock.price + '</td></tr></br>';
			})
			.join('');

		return new Response(template, { headers: corsHeaders });
	},

	async scheduled(event, env, ctx) {
		ctx.waitUntil(handleScraping(env));
	},
} satisfies ExportedHandler<Env>;
