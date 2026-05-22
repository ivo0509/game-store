import { NextRequest } from "next/server";

const HTML = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Game Store API Docs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container { max-width: 860px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; color: #f8fafc; }
    .subtitle { color: #94a3b8; margin-bottom: 2.5rem; font-size: 0.95rem; }
    h2 { font-size: 1.1rem; font-weight: 600; color: #94a3b8; text-transform: uppercase;
         letter-spacing: 0.08em; margin: 2.5rem 0 1rem; border-bottom: 1px solid #1e293b;
         padding-bottom: 0.4rem; }
    .endpoint {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      overflow: hidden;
    }
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1.25rem;
      cursor: pointer;
      user-select: none;
    }
    .method {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 5px;
      letter-spacing: 0.05em;
      min-width: 52px;
      text-align: center;
    }
    .get  { background: #1d4ed8; color: #bfdbfe; }
    .post { background: #15803d; color: #bbf7d0; }
    .path { font-family: "JetBrains Mono", "Fira Code", monospace; font-size: 0.92rem;
            color: #e2e8f0; flex: 1; }
    .badge-auth {
      font-size: 0.7rem;
      background: #7c3aed;
      color: #ede9fe;
      border-radius: 4px;
      padding: 0.15rem 0.45rem;
      font-weight: 600;
    }
    .endpoint-body { padding: 0 1.25rem 1.25rem; border-top: 1px solid #334155; }
    .desc { color: #94a3b8; font-size: 0.9rem; margin: 0.75rem 0 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.87rem; }
    th { text-align: left; color: #64748b; padding: 0.35rem 0.5rem; font-weight: 600;
         text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.05em; }
    td { padding: 0.4rem 0.5rem; color: #cbd5e1; border-top: 1px solid #1e293b; }
    td code, th code { font-family: monospace; background: #0f1117; padding: 0.1rem 0.35rem;
                       border-radius: 4px; font-size: 0.85em; color: #a5b4fc; }
    .required { color: #f87171; font-size: 0.75rem; }
    pre {
      background: #0f1117;
      border: 1px solid #334155;
      border-radius: 7px;
      padding: 1rem;
      overflow-x: auto;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      font-size: 0.82rem;
      color: #a5f3fc;
      margin-top: 0.75rem;
    }
    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 0.9rem;
      margin-bottom: 0.3rem;
    }
    .info-box {
      background: #172033;
      border: 1px solid #1e40af;
      border-radius: 8px;
      padding: 0.85rem 1.1rem;
      color: #93c5fd;
      font-size: 0.88rem;
      margin-bottom: 2rem;
    }
    .info-box strong { color: #bfdbfe; }
  </style>
</head>
<body>
<div class="container">
  <h1>Game Store API</h1>
  <p class="subtitle">Mobile REST API &mdash; v1</p>

  <div class="info-box">
    <strong>Authentication:</strong> All endpoints (except <code>/api/auth/login</code>) require a
    <code>Authorization: Bearer &lt;token&gt;</code> header. Obtain a token via the login endpoint.
  </div>

  <!-- ── Auth ── -->
  <h2>Authentication</h2>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method post">POST</span>
      <span class="path">/api/auth/login</span>
    </div>
    <div class="endpoint-body">
      <p class="desc">Authenticate with email and password. Returns a signed JWT token.</p>
      <div class="section-label">Request body (JSON)</div>
      <table>
        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>email</code></td><td>string</td><td><span class="required">yes</span></td><td>User email address</td></tr>
        <tr><td><code>password</code></td><td>string</td><td><span class="required">yes</span></td><td>Account password</td></tr>
      </table>
      <div class="section-label">200 Response</div>
      <pre>{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}</pre>
    </div>
  </div>

  <!-- ── Games ── -->
  <h2>Games</h2>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method get">GET</span>
      <span class="path">/api/games</span>
      <span class="badge-auth">JWT</span>
    </div>
    <div class="endpoint-body">
      <p class="desc">List all published games available for purchase. Supports pagination.</p>
      <div class="section-label">Query parameters</div>
      <table>
        <tr><th>Param</th><th>Type</th><th>Default</th><th>Description</th></tr>
        <tr><td><code>page</code></td><td>integer</td><td>1</td><td>Page number (1-based)</td></tr>
        <tr><td><code>limit</code></td><td>integer</td><td>20</td><td>Items per page (max 100)</td></tr>
      </table>
      <div class="section-label">200 Response</div>
      <pre>{
  "data": [
    {
      "id": 3,
      "title": "Stellar Drift",
      "description": "...",
      "genre": "Action",
      "platforms": ["PC", "PS5"],
      "releaseDate": "2024-06-01",
      "price": "29.99",
      "discountPercent": 10,
      "coverImageUrl": "https://...",
      "trailerUrl": "https://...",
      "ageRating": "T"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method get">GET</span>
      <span class="path">/api/games/:id</span>
      <span class="badge-auth">JWT</span>
    </div>
    <div class="endpoint-body">
      <p class="desc">Retrieve full details for a published game, including purchase status, purchase count, and reviews.</p>
      <div class="section-label">Path parameters</div>
      <table>
        <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>id</code></td><td>integer</td><td>Game ID</td></tr>
      </table>
      <div class="section-label">200 Response</div>
      <pre>{
  "id": 3,
  "title": "Stellar Drift",
  "description": "An epic space adventure.",
  "genre": "Action",
  "platforms": ["PC", "PS5"],
  "releaseDate": "2024-06-01",
  "price": "29.99",
  "discountPercent": 10,
  "coverImageUrl": "https://...",
  "trailerUrl": "https://...",
  "ageRating": "T",
  "isPurchased": false,
  "purchasedCount": 152,
  "reviews": [
    {
      "id": 7,
      "rating": 5,
      "comment": "Amazing game!",
      "authorName": "Jane Doe",
      "createdAt": "2024-07-10T14:30:00.000Z"
    }
  ]
}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method post">POST</span>
      <span class="path">/api/games/:id/add-to-cart</span>
      <span class="badge-auth">JWT</span>
    </div>
    <div class="endpoint-body">
      <p class="desc">Purchase a game directly. Deducts the price from the user's wallet and adds the game to their library. Fails if the game is already owned or if the wallet balance is insufficient.</p>
      <div class="section-label">Path parameters</div>
      <table>
        <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>id</code></td><td>integer</td><td>Game ID</td></tr>
      </table>
      <div class="section-label">201 Response</div>
      <pre>{
  "message": "Successfully purchased \\"Stellar Drift\\".",
  "orderId": 88,
  "finalPrice": "26.99"
}</pre>
      <div class="section-label">400 errors</div>
      <table>
        <tr><th>Error message</th><th>Reason</th></tr>
        <tr><td>You already own this game.</td><td>Duplicate purchase attempt</td></tr>
        <tr><td>Insufficient wallet balance.</td><td>Not enough funds</td></tr>
        <tr><td>Game not found or not available for purchase.</td><td>Game is draft / blocked</td></tr>
      </table>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method post">POST</span>
      <span class="path">/api/games/:id/refund</span>
      <span class="badge-auth">JWT</span>
    </div>
    <div class="endpoint-body">
      <p class="desc">Refund a previously purchased game. The purchase price is returned to the user's wallet and deducted from the publisher's balance.</p>
      <div class="section-label">Path parameters</div>
      <table>
        <tr><th>Param</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>id</code></td><td>integer</td><td>Game ID</td></tr>
      </table>
      <div class="section-label">200 Response</div>
      <pre>{
  "message": "Refund processed successfully. Funds returned to your wallet.",
  "publisherName": "Indie Studio X"
}</pre>
      <div class="section-label">400 errors</div>
      <table>
        <tr><th>Error message</th><th>Reason</th></tr>
        <tr><td>No purchase found for this game.</td><td>Game was never purchased or already refunded</td></tr>
      </table>
    </div>
  </div>

  <!-- ── Error format ── -->
  <h2>Error Responses</h2>
  <p class="desc" style="margin-bottom:0.75rem">All errors follow a consistent JSON format:</p>
  <pre>{
  "error": "Human-readable error message."
}</pre>
  <table style="margin-top:1rem">
    <tr><th>Status</th><th>Meaning</th></tr>
    <tr><td>400</td><td>Bad request / validation error</td></tr>
    <tr><td>401</td><td>Missing or invalid JWT token</td></tr>
    <tr><td>403</td><td>Forbidden (e.g. publisher trying to purchase)</td></tr>
    <tr><td>404</td><td>Resource not found</td></tr>
    <tr><td>500</td><td>Internal server error</td></tr>
  </table>
</div>
</body>
</html>`;

export async function GET(_request: NextRequest) {
  return new Response(HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
