import setScraping from '../service/scraping';
import { isTableSET100Exist, isTableSET100PRICESExist, insertSET100PRICES } from '../service/database';
import { convertToBangkokTime, isBusinessHour, isWeekend } from '../utils/timeUtils';

async function startScraping(env: any) {
	const date = new Date();
	const bangkokTime = convertToBangkokTime(date.getTime());

	if (isWeekend(bangkokTime) || !isBusinessHour(bangkokTime)) {
		return;
	}

	const stocks = await setScraping();
	const formatedDate = date.toISOString().replace('T', ' ').replace('Z', '');
	console.log('stocks recorded length: ', stocks.length);
	if (stocks.length === 0) {
		console.log('No stock data found');
	} else {
		// check if tables are existed
		await isTableSET100Exist(env);
		await isTableSET100PRICESExist(env);

		await insertSET100PRICES(env, stocks, formatedDate);
		console.log('New stock prices inserted successfully');
	}
}

export default startScraping;
