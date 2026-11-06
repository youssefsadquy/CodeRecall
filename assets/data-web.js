window.CARDS = (window.CARDS || []).concat([
  {
    id: 'web-http-lifecycle', deck: 'web', topic: 'HTTP', type: 'concept',
    q: 'Walk through what happens after a user submits a form.',
    a: [
      'The browser validates and serialises the fields, then sends a request with a method, URL, headers and body.',
      'DNS resolves the host, TCP and TLS are established, and the server routes the request to a handler.',
      'The handler validates input, writes to the database, and returns a status code plus a response the browser renders.'
    ],
    why: 'This is the full-stack interview in one question. Show that you can move across every layer.',
    hint: 'Browser, network, server, database, response.'
  },
  {
    id: 'web-rest-design', deck: 'web', topic: 'API design', type: 'concept',
    q: 'How would you design endpoints for a blog\'s posts and comments?',
    a: [
      'Use nouns, not verbs: GET /posts, GET /posts/:id, POST /posts, PATCH /posts/:id, DELETE /posts/:id.',
      'Nest genuinely owned resources: GET /posts/:id/comments, POST /posts/:id/comments.',
      'Use query parameters for filtering, sorting and pagination, and status codes for outcomes.'
    ],
    why: 'The noun/verb and nesting rules are the practical core of REST design.',
    hint: 'URLs name things; methods describe actions.'
  },
  {
    id: 'web-auth-authz', deck: 'web', topic: 'Security', type: 'concept',
    q: 'Authentication vs authorisation — what is the difference?',
    a: [
      'Authentication answers "who are you": login, password, token, SSO.',
      'Authorisation answers "what may you do": roles, permissions, ownership checks.',
      'A request can be authenticated and still forbidden: a valid user editing someone else\'s post should get 403.'
    ],
    why: 'Broken object-level authorisation is a top web vulnerability. Always check ownership, not just login.',
    hint: 'Identity first, permission second.'
  },
  {
    id: 'web-password-hash', deck: 'web', topic: 'Security', type: 'concept',
    q: 'How should passwords be stored?',
    a: [
      'Hash them with a slow, salted algorithm designed for passwords: bcrypt, scrypt or Argon2.',
      'Never encrypt them or use fast hashes like SHA-256 alone; attackers can brute-force billions per second.',
      'Use a per-user random salt and a work factor tuned so one hash takes around 100 ms.'
    ],
    why: 'The word "slow" is the key. Password hashing is deliberately expensive to make guessing costly.',
    hint: 'Fast hash vs deliberately slow hash.'
  },
  {
    id: 'web-xss', deck: 'web', topic: 'Security', type: 'concept',
    q: 'What is XSS, and how do you prevent it?',
    a: [
      'Cross-site scripting injects attacker JavaScript into a page that other users load.',
      'Prevent it by escaping output for the correct context, and by avoiding dangerous sinks such as innerHTML and eval.',
      'A strict Content-Security-Policy and HttpOnly cookies reduce the impact but do not replace escaping.'
    ],
    why: 'The distinction between stored, reflected and DOM-based XSS is a good follow-up; all three need output encoding.',
    hint: 'Untrusted data becomes executable code.'
  },
  {
    id: 'web-csrf', deck: 'web', topic: 'Security', type: 'concept',
    q: 'What is CSRF, and which defences work?',
    a: [
      'The attacker\'s site makes the victim\'s browser send an authenticated request to your site, using the cookie the browser attaches automatically.',
      'Defend with SameSite=Lax or Strict cookies, CSRF tokens tied to the session, and checking the Origin header.',
      'APIs that use an Authorization header rather than cookies are not vulnerable in the same way, because the browser does not attach it automatically.'
    ],
    why: 'The root cause is ambient credentials, not a missing password.',
    hint: 'The browser sends the cookie whether the user meant to or not.'
  },
  {
    id: 'web-sqli', deck: 'web', topic: 'Security', type: 'code',
    q: 'Why is this query dangerous, and how do you fix it?',
    code: '// vulnerable\nconst sql = `SELECT * FROM users WHERE email = \'${email}\'`;\n\n// fixed\nconst sql = \'SELECT * FROM users WHERE email = ?\';\ndb.query(sql, [email]);',
    a: [
      'String interpolation lets the input change the SQL structure: an email of \' OR 1=1 -- returns every user.',
      'Parameterised queries send the SQL and the values separately, so values are never parsed as code.',
      'Also validate input and use a least-privilege database user, but parameters are the primary defence.'
    ],
    why: 'SQL injection is still one of the most exploited bugs. The fix is structural, not a filter.',
    hint: 'Keep code and data in separate channels.'
  },
  {
    id: 'web-cors-preflight', deck: 'web', topic: 'CORS', type: 'concept',
    q: 'When does a browser send a CORS preflight request?',
    a: [
      'For non-simple requests: methods other than GET/HEAD/POST, or custom headers such as Authorization or Content-Type: application/json.',
      'It sends OPTIONS first with Origin and Access-Control-Request-Method, and the server must approve with Access-Control-Allow-* headers.',
      'Simple GET/POST with basic content types skip the preflight but still need Access-Control-Allow-Origin to read the response.'
    ],
    why: 'The distinction between "the request happened" and "JavaScript may read the response" is the key insight.',
    hint: 'Custom headers or uncommon methods trigger an OPTIONS check.'
  },
  {
    id: 'web-cookie-flags', deck: 'web', topic: 'Cookies', type: 'concept',
    q: 'What do HttpOnly, Secure and SameSite do?',
    a: [
      'HttpOnly hides the cookie from JavaScript, limiting XSS token theft.',
      'Secure sends it only over HTTPS.',
      'SameSite controls cross-site sending: Strict never sends it cross-site, Lax sends it on top-level navigation GETs, None requires Secure.'
    ],
    why: 'These three flags are the baseline for any session cookie. SameSite=Lax is a good default.',
    hint: 'Script access, transport, and cross-site behaviour.'
  },
  {
    id: 'web-oauth-pkce', deck: 'web', topic: 'Auth', type: 'concept',
    q: 'Why does the OAuth authorisation code flow use PKCE in SPAs and mobile apps?',
    a: [
      'Public clients cannot keep a client secret, so the code alone would be stealable.',
      'PKCE has the app generate a random verifier, send its hash as the challenge, and present the verifier when exchanging the code.',
      'An attacker who intercepts the code cannot exchange it without the verifier.'
    ],
    why: 'PKCE turns a public client into something that can still prove it started the flow.',
    hint: 'A secret you cannot store — so prove something else.'
  },
  {
    id: 'web-pagination', deck: 'web', topic: 'API design', type: 'concept',
    q: 'Offset pagination vs cursor pagination — when do you use each?',
    a: [
      'Offset/limit is simple and allows jumping to a page, but it gets slower deep in large tables and duplicates rows when data shifts.',
      'Cursor pagination uses an opaque pointer (usually the last id or sort key), giving stable, efficient results for infinite scroll.',
      'Use offset for small admin tables; cursor for large feeds and APIs that change frequently.'
    ],
    why: 'The duplicate-row problem during inserts is the detail that proves you have used it.',
    hint: 'SKIP 100000 is expensive, and rows move.'
  },
  {
    id: 'web-versioning', deck: 'web', topic: 'API design', type: 'concept',
    q: 'How should you version a public API?',
    a: [
      'Version only when you must make a breaking change: removing fields, changing types, tightening validation.',
      'Common schemes: /v1/ in the path, a version header or media type. Path versions are the easiest to see and test.',
      'Prefer additive evolution; deprecate with a timeline, telemetry and clear migration docs.'
    ],
    why: 'Most changes should not need a version at all. That is the mature answer.',
    hint: 'Is the change actually breaking?'
  },
  {
    id: 'web-idempotent-post', deck: 'web', topic: 'API design', type: 'code',
    q: 'How does an API make POST retries safe?',
    code: 'POST /payments\nIdempotency-Key: 7f1c-...\n\n// server: if key exists, return stored response\n// otherwise process once and store key + result',
    a: [
      'The client generates a unique key per logical operation and reuses it across retries.',
      'The server stores the key with the response and returns that response on repeats.',
      'Keys need a TTL and a scope (customer or account) so they cannot collide across users.'
    ],
    why: 'This is the concrete implementation of the idempotency idea, and it comes up in every payments design.',
    hint: 'A unique token per operation, cached with the result.'
  },
  {
    id: 'web-react-state', deck: 'web', topic: 'React', type: 'concept',
    q: 'When should state be local, lifted, or global?',
    a: [
      'Local: only one component cares (an input value, a dropdown open flag).',
      'Lifted: a few siblings need to share it — put it in the closest common parent.',
      'Global: cross-cutting state such as auth, theme or a cache; prefer a server-state library for server data rather than a global store.'
    ],
    why: 'Most state bugs come from putting everything in global state. Colocate first.',
    hint: 'Who actually needs to read it?'
  },
  {
    id: 'web-useeffect', deck: 'web', topic: 'React', type: 'code',
    q: 'What is wrong with this effect?',
    code: 'useEffect(() => {\n  fetch(\'/api/users\').then(r => r.json()).then(setUsers);\n}, [users]);',
    a: [
      'The effect depends on users and also sets users, so it re-runs forever.',
      'It also has no cleanup, so a response can arrive after unmount or after a newer request and overwrite fresher data.',
      'Fix: depend on the actual inputs (often an empty array for mount), and use an AbortController or an ignore flag in cleanup.'
    ],
    why: 'This combines the two classic effect bugs: a dependency loop and a race condition.',
    hint: 'What does the effect change, and what does it depend on?'
  },
  {
    id: 'web-ssr-csr', deck: 'web', topic: 'Rendering', type: 'concept',
    q: 'Compare CSR, SSR and SSG.',
    a: [
      'CSR: the browser downloads JS and renders; simple hosting, slow first paint, poor SEO without extra work.',
      'SSR: the server renders HTML per request; fast first paint and good SEO, but more server work and hydration cost.',
      'SSG: HTML is built ahead of time; fastest and cheapest to serve, but content is stale until rebuild (ISR improves this).'
    ],
    why: 'The trade-off is freshness vs latency vs server cost. Match it to the content.',
    hint: 'Where and when is the HTML produced?'
  },
  {
    id: 'web-hydration', deck: 'web', topic: 'Rendering', type: 'concept',
    q: 'What is hydration in a server-rendered app?',
    a: [
      'The server sends HTML so the page is visible immediately, then the client downloads JS and attaches event handlers.',
      'During hydration React reuses the existing DOM instead of recreating it.',
      'A mismatch between server and client markup causes a hydration error and a full client re-render.'
    ],
    why: 'Hydration explains both the good first paint of SSR and its hidden JS cost.',
    hint: 'HTML first, interactivity second.'
  },
  {
    id: 'web-caching-headers', deck: 'web', topic: 'HTTP', type: 'concept',
    q: 'How do ETag and Cache-Control work together?',
    a: [
      'Cache-Control: max-age sets how long the response is fresh and can be reused without asking.',
      'Once stale, the client sends If-None-Match with the ETag; the server replies 304 Not Modified if unchanged.',
      'This saves bandwidth while keeping correctness. Immutable hashed assets can be cached for a year.'
    ],
    why: 'Freshness vs validation is the mental model for all HTTP caching.',
    hint: 'Fresh for a while, then ask cheaply whether it changed.'
  },
  {
    id: 'web-joins', deck: 'web', topic: 'SQL', type: 'concept',
    q: 'Explain inner, left, right and full joins.',
    a: [
      'Inner: only rows with a match on both sides.',
      'Left: all left rows, with nulls where the right side has no match.',
      'Right: the mirror. Full: all rows from both sides, nulls where either is missing.'
    ],
    why: 'The classic trap: filtering a left-joined table in WHERE turns it into an inner join. Put the condition in the ON clause.',
    hint: 'Which side keeps its unmatched rows?'
  },
  {
    id: 'web-transactions', deck: 'web', topic: 'SQL', type: 'concept',
    q: 'How do you prevent lost updates when two users edit the same row?',
    a: [
      'Optimistic locking: include a version column, update WHERE id = ? AND version = ?, and fail if zero rows changed.',
      'Pessimistic locking: SELECT ... FOR UPDATE holds the row until commit.',
      'Optimistic is better for low contention and web APIs; pessimistic is simpler under heavy contention.'
    ],
    why: 'A read-modify-write across two requests is the most practical concurrency bug in web apps.',
    hint: 'Two users load the same form and both save.'
  },
  {
    id: 'web-validation', deck: 'web', topic: 'API design', type: 'concept',
    q: 'Where should input validation happen?',
    a: [
      'On the client for fast feedback and UX, never as the only defence.',
      'On the server at the boundary, using a schema validator, because clients can be bypassed.',
      'In the database with constraints as the last line of defence for invariants.'
    ],
    why: 'Defence in depth: each layer has a different job, and the server is mandatory.',
    hint: 'Convenience vs trust.'
  },
  {
    id: 'web-websocket', deck: 'web', topic: 'Realtime', type: 'concept',
    q: 'Polling, long polling or WebSockets — how do you choose?',
    a: [
      'Short polling is simple but wasteful and adds latency; fine for low-frequency updates.',
      'Long polling holds the request until data arrives, approximating push with ordinary HTTP.',
      'WebSockets give a persistent bidirectional connection for chat, games and live collaboration; they need connection management and scaling support.'
    ],
    why: 'The answer is about update frequency and direction, plus operational cost.',
    hint: 'How often does data change, and who speaks first?'
  },
  {
    id: 'web-graphql-rest', deck: 'web', topic: 'API design', type: 'concept',
    q: 'GraphQL vs REST — what are the real trade-offs?',
    a: [
      'GraphQL lets clients request exactly the fields they need and fetch related data in one round trip.',
      'The cost is complexity: query depth limits, N+1 resolution, caching is harder, and authorisation must be enforced per field.',
      'REST is simpler to cache and reason about, and often better for public or resource-oriented APIs.'
    ],
    why: 'GraphQL solves over-fetching but introduces new problems; a balanced answer wins.',
    hint: 'Flexible queries vs cacheable resources.'
  },
  {
    id: 'web-env-secrets', deck: 'web', topic: 'Deployment', type: 'concept',
    q: 'Why must secrets not be committed or exposed in frontend code?',
    a: [
      'Anything bundled for the browser is public; an API key in frontend JS can be extracted in seconds.',
      'Secrets belong in server-side environment variables or a secrets manager, never in git history.',
      'If a secret leaks, rotate it — removing the commit is not enough.'
    ],
    why: 'The rule is simple: the client is hostile. Server-side only for privileged credentials.',
    hint: 'Assume the user opens devtools.'
  },
  {
    id: 'web-accessibility', deck: 'web', topic: 'Frontend', type: 'concept',
    q: 'What are the highest-value accessibility basics?',
    a: [
      'Use semantic HTML: button for actions, a for navigation, label for inputs, and headings in order.',
      'Ensure keyboard access and visible focus, and give images meaningful alt text.',
      'Check contrast and never convey information by colour alone.'
    ],
    why: 'Semantic HTML gives screen readers, keyboard users and search engines the structure for free.',
    hint: 'Right element, keyboard, labels, contrast.'
  },
  {
    id: 'web-deploy', deck: 'web', topic: 'Deployment', type: 'concept',
    q: 'What is a blue-green deployment?',
    a: [
      'Run two identical environments: blue is live, green is the new version.',
      'Deploy and test on green, then switch traffic at the load balancer.',
      'Rollback is instant because blue is still running; the cost is double infrastructure during the switch.'
    ],
    why: 'The instant rollback is the point, and it contrasts with rolling and canary deployments.',
    hint: 'Two environments, one switch.'
  }
]);
