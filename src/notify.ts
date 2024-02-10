import { Series } from "./fred";

const ntfyAPIUrlBase = 'https://ntfy.sh';

export class NotifyAPI {
    topicName: string;
    apiUrlBase: string;

    constructor(topicName: string, apiUrlBase?: string) {
        this.topicName = topicName;
        this.apiUrlBase = apiUrlBase == undefined || apiUrlBase == '' ? ntfyAPIUrlBase : apiUrlBase;
    }

    async notify(series: Series): Promise<void> {
        let url = new URL(this.topicName, this.apiUrlBase);
        
        const headers = new Headers();
        headers.append('Title', 'Mortgage Rate Alert');
        headers.append('Priority', 'default');
        headers.append('Markdown', 'yes');

        const reqInit = {
            method: 'POST',
            body: notificationText(series),
            headers: headers,
        }
        let resp = await fetch(url.toString(), reqInit);
        if (resp.status != 200) {
		    console.log(`error fetching from notify api, got status: ${resp.status}`);
            throw new Error(`notify api returned non-200 status: ${resp.status}`);
        }
    }
}

function notificationText(series: Series): string {
    const latest = series.observations[0]
    return `
    As of **${latest.date}** the [${series.type}](https://fred.stlouisfed.org/series/${series.type}) average is **${latest.value}**.
    `
}