import { set100 } from '../constants/set100';
import { stockData } from '../model/stock';

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

export { getSET100PRICES, insertSET100, insertSET100PRICES, isTableSET100Exist, isTableSET100PRICESExist };
