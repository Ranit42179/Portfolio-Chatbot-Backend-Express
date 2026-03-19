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

