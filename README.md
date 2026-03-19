# Gemini Express Proxy

Simple Express backend to forward request body to Gemini backend API and return text from response.

## Setup

1. Copy `.env.example` to `.env` and set values:

```
PORT=3000
BACKEND_GEMINI_URL=your Gemini endpoint
GOOGLE_API_KEY=your key
```

2. Install dependencies:

```
npm install
```

3. Run:

```
npm start
```

## API

POST `/api/gemini`

Headers:
- `Content-Type: application/json`

Body format:

```json
{
  "question": "how can i get good score in wings 1?"
}
```

The server converts this to Gemini body: `contents[0].parts[0].text`.

Response:

Plain text body containing the generated answer.

Example:
```
Achieving a high score in TCS Wings 1 is ...
```

## Deploy on Render

1. Push your repo to GitHub.
2. In Render, create a new Web Service and connect your GitHub repo.
3. For Build Command use `npm install` (or leave blank to use render.yaml).
4. For Start Command use `npm start`.
5. Add environment variables in Render dashboard:
   - `BACKEND_GEMINI_URL`
   - `GOOGLE_API_KEY`
6. Deploy.

Your API endpoint will be `${your-service-url}/api/gemini`.

