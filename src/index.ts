import { FredAPI, MortgageType, mortgageType } from './fred';
import { NotifyAPI } from './notify';

export interface Env {
	FRED_API_KEY: string;
	NOTIFY_TOPIC: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const reqUrl = new URL(request.url);
		let resp = new Response(null, {status: 404});
		const push = (reqUrl.searchParams.get('push') === 'true');
		if (reqUrl.pathname == '/rates') {
			const type = mortgageType(reqUrl.searchParams.get('type') ?? 'fixed30');
			const from = reqUrl.searchParams.get('from') ?? undefined; 

			const api = new FredAPI(env.FRED_API_KEY);
			await api.getRates(type, from)
				.then((result) => {
					let respStr = JSON.stringify(result);
					const init = {
						headers: {
						  "content-type": "application/json;charset=UTF-8",
						},
					  };
					console.log('successfully got rates');
					resp = new Response(respStr, init)
					
					if (push) {
						const notifyApi = new NotifyAPI(env.NOTIFY_TOPIC);
						return notifyApi.notify(result).then(() => {
							console.log('successfully pushed notification');
						}, 
						(error) => {
							console.log(`got error pushing notification: ${error}`);
						});
					}
				},
				(error) => {
					console.log(`got error from rates: ${error}`);
					resp = new Response(null, {status: 500})
				});
		}

		return resp
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const api = new FredAPI(env.FRED_API_KEY);
		const notifyApi = new NotifyAPI(env.NOTIFY_TOPIC);
		await api.getRates(MortgageType.Fixed30, undefined)
		.then((result) => {
			return notifyApi.notify(result).then(() => {
				console.log('successfully pushed notification');
			}, 
			(error) => {
				console.log(`got error pushing notification: ${error}`);
			});
		},
		(error) => {
			console.log(`got error from rates: ${error}`);
		});
	},
};
