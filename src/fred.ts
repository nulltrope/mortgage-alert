import dayjs from 'dayjs';

const fredAPIUrlBase = 'https://api.stlouisfed.org';
const fredAPIObservations = '/fred/series/observations';
const fredTimeFormat = 'YYYY-MM-DD';
const fredObservationLimit = 1000;

export enum MortgageType {
    Fixed30 = 'MORTGAGE30US',
    Fixed15 = 'MORTGAGE15US',
}

export function mortgageType(param: string): MortgageType {
    if (param == 'fixed15') {
        return MortgageType.Fixed15
    } else {
        // Also the default case
        return MortgageType.Fixed30
    }
}

export interface FredSeriesObservations {
    realtime_start: string;
    realtime_end: string;
    observation_start: string;
    observation_end: string;
    units: string;
    order_by: string;
    sort_order: string;
    count: number;
    limit: number;
    observations: Observation[];
}

export interface Series {
    type: MortgageType;
    observations: Observation[];
}

export interface Observation {
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
}

export class FredAPI {
    apiToken: string;
    apiUrlBase: string;
    apiUrlPath: string;

    constructor(apiToken: string, apiUrlBase?: string, apiUrlPath?:string) {
        this.apiToken = apiToken;
        this.apiUrlBase = apiUrlBase == undefined || apiUrlBase == '' ? fredAPIUrlBase : apiUrlBase;
        this.apiUrlPath = apiUrlPath == undefined || apiUrlPath == '' ? fredAPIObservations : apiUrlPath;
    }

    async getRates(type: MortgageType, from?: string, limit?: number): Promise<Series> {
        let end = dayjs().format(fredTimeFormat);
        let start: string;
        if (from !== undefined) {
            start = dayjs(from).format(fredTimeFormat);
        } else {
            start = dayjs().subtract(7, 'day').format(fredTimeFormat);
        }

        let url = new URL(this.apiUrlPath, this.apiUrlBase);
        url.searchParams.append('api_key', this.apiToken);
        url.searchParams.append('file_type', 'json');
        url.searchParams.append('series_id', type.toString());
        url.searchParams.append('limit', fredObservationLimit.toString());
        url.searchParams.append('observation_start', start);
	    url.searchParams.append('observation_end', end);
	    url.searchParams.append('sort_order', 'desc');

        let resp = await fetch(url.toString());
        if (resp.status != 200) {
		    console.log(`error fetching from FRED api, got status: ${resp.status}`);
            throw new Error(`FRED api returned non-200 status: ${resp.status}`);
        }

        let obj: FredSeriesObservations = await resp.json();
        let observations: Observation[] = [];
        for (const obsv of obj.observations) {
            observations.push(obsv)
        }

        return {
            type: type,
            observations: observations,
        }
	}   
}