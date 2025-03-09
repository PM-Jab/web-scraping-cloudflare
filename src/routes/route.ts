import getSET100prices from '../handler/getSET100Prices';

const routes: { [key: string]: { [method: string]: (req: Request, env: any, ctx: any) => Response | Promise<Response> } } = {
	'/set100/prices': { GET: getSET100prices },
};

export default routes;
