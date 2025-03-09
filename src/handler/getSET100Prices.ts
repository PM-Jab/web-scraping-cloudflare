import setScraping from '../service/scraping';
import { corsHeaders } from '../constants/cors';
const getSET100prices = async () => {
	const stocks = await setScraping();

	const template = stocks
		.map((stock) => {
			return '<tr><td>' + stock.symbol + ':   </td><td>' + stock.price + '</td></tr></br>';
		})
		.join('');

	return new Response(template, { headers: corsHeaders });
};

export default getSET100prices;
