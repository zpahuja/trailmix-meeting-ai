# Trailmix

# Setup

- Copy the `env.example` file to a `.env` file:
    - `cp .env.example .env`

- Replace `RECALLAI_API_URL` with the base URL for the [Recall region](https://docs.recall.ai/docs/regions#/) that you're using that matches your API key, example:
    - `RECALLAI_API_URL=https://us-east-1.recall.ai`

- Modify `.env` to include your Recall.ai API key:
    - `RECALLAI_API_KEY=<your key>`

If you want to enable the AI summary after a recording is finished, you can specify an OpenRouter API key.

```
OPENROUTER_KEY=<your key>
```

To launch the Trailmix application, start the server first, then the app:

```sh
npm install
npm ci
npm start
```