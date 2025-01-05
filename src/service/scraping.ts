import { load } from 'cheerio';
import { set100 } from '../constants/set100';
import { stockData } from '../model/stock';

const setScraping = async (): Promise<stockData[]> => {
	const stock: stockData[] = [];
	let price;

	console.log('Scraping stock prices...');
	let fakeHeader: any = await (
		await fetch('https://headers.scrapeops.io/v1/browser-headers?api_key=0c0a33f4-4722-454c-981d-e44de8d03db7&num_results=5')
	).json();

	const mod = fakeHeader.result.length;

	console.log('fakeHeader amount: ', mod);

	for (let i = 0; i < set100.length; i++) {
		const symbol = set100[i];
		const response = await fetch(`https://www.set.or.th/th/market/product/stock/quote/${symbol}/price`, {
			headers: {
				'upgrade-insecure-requests': fakeHeader.result[i % mod]['upgrade-insecure-requests'] || '',
				'user-agent': fakeHeader.result[i % mod]['user-agent'] || '',
				accept: fakeHeader.result[i % mod]['accept'] || '',
				'sec-ch-ua': fakeHeader.result[i % mod]['sec-ch-ua'] || '',
				'sec-ch-ua-mobile': fakeHeader.result[i % mod]['sec-ch-ua-mobile'] || '',
				'sec-ch-ua-platform': fakeHeader.result[i % mod]['sec-ch-ua-platform'] || '',
				'sec-fetch-site': fakeHeader.result[i % mod]['sec-fetch-site'] || '',
				'sec-fetch-mod': fakeHeader.result[i % mod]['sec-fetch-mod'] || '',
				'sec-fetch-user': fakeHeader.result[i % mod]['sec-fetch-user'] || '',
				'accept-encoding': fakeHeader.result[i % mod]['accept-encoding'] || '',
				'accept-language': fakeHeader.result[i % mod]['accept-language'] || '',
			},
		});
		const html = await response.text();

		// Load the HTML into cheerio
		const $ = load(html);

		// Find the price element (adjust the selector based on the actual HTML structure)
		price = $(
			'.quote-info.d-flex.flex-column .d-flex.flex-column.flex-md-row.flex-wrap.align-items-start.align-items-md-center .quote-info-left-values.d-flex.align-items-end.me-auto.col.mb-1.mb-md-0 .value'
		)
			.text()
			.trim();

		stock.push({ symbol, price: parseFloat(price) });
	}
	return stock;
};

export default setScraping;
