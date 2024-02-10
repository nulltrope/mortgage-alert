# Mortgage Notifier

This is a simple Cloudflare Worker which can run to pull current US Mortgage Rate information, and send a push notification on some interval. Currently, it uses the [St. Louis Fed's 30-Year Fixed Rate Mortgage Average](https://fred.stlouisfed.org/series/MORTGAGE30US).

## Running

### Pre-requisites

1. API Keys
    - Before running locally, you will need to obtain an API key for the FRED Mortgage API. To obtain a FRED API (or developer) key, you must make a free account on their website, and then request a key. Details [are here](https://fred.stlouisfed.org/docs/api/api_key.html).
    - Ntfy.sh - while not an API-key per-se, you should decide on a subscription name to use and treat it as a secret. Also, [download the app](https://ntfy.sh/) while you're at it. 
2. Fork and then clone the repo using your preferred git client.
3. Install `wrangler` locally per the [official instructions](https://developers.cloudflare.com/workers/wrangler/install-and-update/).

### Running Locally

1. Create a file called `.dev.vars` in the repo root (note: this should be gitignored!) and populate the file with the following vars:
    - `FRED_API_KEY=<api key for FRED API you created above>`
    - `NOTIFY_TOPIC=<some unique topic name for your notify subscription>`
    NOTE: you should choose a hard-to-guess notify topic and treat it as secret, as anyone with the name can send push notifications to you.
2. Run `npx wrangler dev` to startup a local instance of the worker
3. You can now make requests to it and optionally push notifications (if setup) via `curl` or your browser, by requesting `http://localhost:<port output by wrangler>/rates?push=true`. 

### Running on Cloudflare (and setting up CRON)

1. The `wrangler.toml` file already contains a cron schedule which is set to run every Thursday (due to Thursday being when FRED updates their mortgage rate data). You can modify this if you wish. 
2. Deploy the worker to Cloudflare by running `npx wrangler deploy`. You may be asked to log into Cloudflare.
3. Finally, you need to upload the secrets you created locally in step 1. of the local steps. For each var name, run `npx wrangler secret put <var name>` and then when prompted, paste the actual secret var data.
4. You can now make requests to it and optionally push notifications (if setup) via `curl` or your browser, by requesting `https://<your custom workers.dev domain>/rates?push=true`. 

Note: you can optionally disable the above workers.dev route by uncommenting the `workers_dev` config in `wrangler.toml`


## Feature List (in no specific order)

- [x] Pull US 30 year fixed mortgage rates from FRED API
- [x] Push notifications to devices using ntfy.sh
- [ ] Allow specifying different mortgage terms & types to pull from FRED API
- [ ] Allow pulling rates from alternate sources that update more frequently (e.g. daily)
- [ ] Allow notifying via email, SMS, or some user-defined webhook