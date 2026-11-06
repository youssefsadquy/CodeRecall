window.CARDS = (window.CARDS || []).concat([
  {
    id: 'core-process-thread', deck: 'core', topic: 'Operating systems', type: 'concept',
    q: 'What is the difference between a process and a thread?',
    a: [
      'A process is an isolated address space plus resources: file descriptors, heap, code. A thread is a unit of execution inside a process.',
      'Threads in the same process share memory, so communication is cheap but a bad write can corrupt another thread.',
      'Context switching between processes is heavier (page tables, TLB) than between threads.'
    ],
    why: 'This distinction drives the choice between multiprocessing (isolation, crash safety) and multithreading (shared state, speed).',
    hint: 'Who shares memory with whom?'
  },
  {
    id: 'core-deadlock', deck: 'core', topic: 'Operating systems', type: 'concept',
    q: 'What four conditions are required for a deadlock?',
    a: [
      'Mutual exclusion: a resource is held exclusively.',
      'Hold and wait: a thread holds one resource while waiting for another.',
      'No preemption: resources cannot be forcibly taken away.',
      'Circular wait: a cycle of threads each waiting on the next.'
    ],
    why: 'Break any one condition and deadlock is impossible. The practical fix is usually consistent lock ordering, which breaks circular wait.',
    hint: 'Four conditions, and you only need to break one.'
  },
  {
    id: 'core-virtual-memory', deck: 'core', topic: 'Operating systems', type: 'concept',
    q: 'Why does an operating system use virtual memory?',
    a: [
      'Each process gets its own virtual address space, so it cannot read or corrupt another process\'s memory.',
      'It allows more memory to be used than physical RAM by paging to disk.',
      'It simplifies allocation and enables sharing of read-only pages such as shared libraries.'
    ],
    why: 'Isolation and overcommit are the two answers interviewers look for; performance via caching is a side effect.',
    hint: 'Think isolation first, capacity second.'
  },
  {
    id: 'core-paging', deck: 'core', topic: 'Operating systems', type: 'code',
    q: 'A system has 4 KB pages and a 32-bit address space. How many pages are there?',
    a: [
      '4 KB is 2^12 bytes, so the offset uses 12 bits.',
      '32 - 12 = 20 bits remain for the page number, giving 2^20 = 1,048,576 virtual pages.',
      'The page table maps each virtual page to a physical frame; a TLB caches recent translations.'
    ],
    why: 'This arithmetic shows up constantly in OS and systems interviews. Be fluent with powers of two.',
    hint: 'Subtract the offset bits from the address width.'
  },
  {
    id: 'core-page-fault', deck: 'core', topic: 'Operating systems', type: 'concept',
    q: 'What happens during a page fault?',
    a: [
      'The CPU looks up a virtual page and finds it is not present in RAM.',
      'It traps to the OS, which loads the page from disk (or allocates a zero page), possibly evicting another page.',
      'The instruction is restarted and the translation is cached in the TLB.'
    ],
    why: 'A page fault is normal, not an error. Thrashing is when faults happen so often that the system spends its time paging.',
    hint: 'Not present in memory — who fixes that, and how does execution resume?'
  },
  {
    id: 'core-scheduling', deck: 'core', topic: 'Operating systems', type: 'concept',
    q: 'Why do operating systems use preemptive scheduling?',
    a: [
      'A long-running or misbehaving thread must not monopolise the CPU.',
      'Preemption gives responsiveness to interactive work and fairness across processes.',
      'The cost is context switching and cache pollution, so the scheduler balances latency against throughput.'
    ],
    why: 'The trade-off sentence — responsiveness vs overhead — is the answer, not a list of algorithm names.',
    hint: 'What happens if a thread never yields?'
  },
  {
    id: 'core-mutex-semaphore', deck: 'core', topic: 'Concurrency', type: 'concept',
    q: 'What is the difference between a mutex and a semaphore?',
    a: [
      'A mutex is ownership-based: one thread locks and must unlock, protecting a critical section.',
      'A semaphore is a counter: it allows N concurrent holders and has no ownership, so another thread can release it.',
      'Use a mutex for mutual exclusion, a semaphore to limit concurrency or signal between threads.'
    ],
    why: 'The ownership detail is what separates them in interviews.',
    hint: 'Which one counts, and which one has an owner?'
  },
  {
    id: 'core-acid', deck: 'core', topic: 'Databases', type: 'concept',
    q: 'What does ACID mean?',
    a: [
      'Atomicity: a transaction fully commits or fully rolls back.',
      'Consistency: it moves the database from one valid state to another, respecting constraints.',
      'Isolation: concurrent transactions do not observe each other\'s partial work.',
      'Durability: committed data survives a crash, usually via a write-ahead log.'
    ],
    why: 'Be ready to explain how durability is achieved (WAL + fsync) rather than just reciting the acronym.',
    hint: 'All-or-nothing, valid states, no interference, survives crash.'
  },
  {
    id: 'core-isolation', deck: 'core', topic: 'Databases', type: 'mcq',
    q: 'Which isolation level prevents non-repeatable reads but still allows phantom reads?',
    choices: [
      'Repeatable read',
      'Read uncommitted',
      'Read committed',
      'Serializable'
    ],
    correct: 0,
    a: [
      'Read uncommitted allows dirty reads.',
      'Read committed prevents dirty reads but a row can change between two reads (non-repeatable read).',
      'Repeatable read locks the rows it reads, but new rows can still appear (phantoms) in the SQL standard model.',
      'Serializable prevents phantoms at the cost of concurrency.'
    ],
    why: 'Know the ladder: dirty read, non-repeatable read, phantom. Each level removes one.',
    hint: 'The classic ladder has four rungs; phantoms are the last to go.'
  },
  {
    id: 'core-normalization', deck: 'core', topic: 'Databases', type: 'concept',
    q: 'What are 1NF, 2NF and 3NF in practical terms?',
    a: [
      '1NF: atomic columns — no repeating groups or comma-separated lists.',
      '2NF: no partial dependency — every non-key column depends on the whole composite key.',
      '3NF: no transitive dependency — non-key columns depend on the key, not on other non-key columns.'
    ],
    why: 'Normalisation removes update anomalies. In practice you normalise first and denormalise deliberately for read performance.',
    hint: 'Atomic, whole key, and nothing but the key.'
  },
  {
    id: 'core-index', deck: 'core', topic: 'Databases', type: 'concept',
    q: 'How does a B-tree index speed up queries, and what does it cost?',
    a: [
      'A B-tree keeps keys sorted so a lookup is O(log n) instead of a full table scan, and it supports range queries and ordering.',
      'Every index adds write cost: each insert/update must maintain the tree, plus disk space.',
      'An index helps only when the query\'s filter or sort can use its leftmost columns.'
    ],
    why: 'The composite-index rule — leftmost prefix — explains most "why is my index ignored" questions.',
    hint: 'Sorted structure, logarithmic lookup, and a write tax.'
  },
  {
    id: 'core-n-plus-one', deck: 'core', topic: 'Databases', type: 'code',
    q: 'What is the N+1 query problem?',
    code: '// 1 query for the list\nvar posts = db.Posts.Take(50).ToList();\nforeach (var p in posts) {\n  // +1 query per post\n  p.Author = db.Users.Find(p.AuthorId);\n}',
    a: [
      'One query fetches N rows, then one extra query per row fetches related data: 1 + N round trips.',
      'It is usually invisible in development with 10 rows and fatal in production with 10,000.',
      'Fix with a join, an eager load (Include), or a batched IN query that fetches all authors at once.'
    ],
    why: 'ORM code makes this easy to write by accident. Watch for queries inside loops.',
    hint: 'Count the round trips as the data grows.'
  },
  {
    id: 'core-transaction', deck: 'core', topic: 'Databases', type: 'concept',
    q: 'How does a write-ahead log provide durability?',
    a: [
      'Before changing data pages, the database appends the change to a log and fsyncs it.',
      'If the process crashes, recovery replays committed log records and discards uncommitted ones.',
      'This turns random page writes into sequential log writes, which is much faster and safer.'
    ],
    why: 'WAL explains both durability and performance. It is also how replication streams changes.',
    hint: 'Log first, data pages later.'
  },
  {
    id: 'core-tcp-udp', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'When would you choose UDP over TCP?',
    a: [
      'UDP has no handshake, ordering or retransmission, so latency is lower and there is no head-of-line blocking.',
      'Choose it for real-time media, games, DNS, and telemetry where a late packet is useless.',
      'Reliability can be added at the application layer (QUIC does exactly this over UDP).'
    ],
    why: 'The answer is about acceptable loss and latency budgets, not "UDP is faster".',
    hint: 'Which application can tolerate a missing packet?'
  },
  {
    id: 'core-tcp-handshake', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'Walk through the TCP three-way handshake.',
    a: [
      'Client sends SYN with an initial sequence number.',
      'Server replies SYN-ACK with its own sequence number and acknowledges the client\'s.',
      'Client sends ACK, and both sides now agree on sequence numbers and the connection is established.'
    ],
    why: 'Three packets are the minimum to synchronise both directions. TLS adds its own handshake on top, which is why HTTPS has extra round trips.',
    hint: 'SYN, SYN-ACK, ACK. Two directions, two sequence numbers.'
  },
  {
    id: 'core-http-versions', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'What are the main differences between HTTP/1.1, HTTP/2 and HTTP/3?',
    a: [
      'HTTP/1.1: one request at a time per connection, so browsers open several connections and head-of-line blocking hurts.',
      'HTTP/2: multiplexes many streams over one TCP connection, adds header compression (HPACK) and server push.',
      'HTTP/3: runs over QUIC (UDP), so a lost packet blocks only its own stream, and the handshake is faster.'
    ],
    why: 'The through-line is head-of-line blocking: at the HTTP level, then at the TCP level.',
    hint: 'Same semantics, different transport and multiplexing.'
  },
  {
    id: 'core-tls', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'What does TLS actually give you?',
    a: [
      'Confidentiality: traffic is encrypted with a shared symmetric key.',
      'Integrity: tampering is detected by authenticated encryption.',
      'Authentication: the certificate proves the server controls the private key for that domain.'
    ],
    why: 'TLS is not "encryption" alone. Without authentication, encryption is useless against a man in the middle.',
    hint: 'Three properties, and one of them is about identity.'
  },
  {
    id: 'core-dns', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'What happens when you type a domain into a browser?',
    a: [
      'The browser checks its cache, then the OS cache, then asks a resolver (often the ISP or 1.1.1.1).',
      'The resolver walks root, TLD and authoritative nameservers to get the A/AAAA record, and caches it for the TTL.',
      'The browser opens a TCP connection (plus TLS), sends the HTTP request, and renders the response.'
    ],
    why: 'This is a systems warm-up question. Mention caching at every layer and the TTL trade-off.',
    hint: 'Caches first, then a hierarchy of nameservers, then TCP and TLS.'
  },
  {
    id: 'core-status-codes', deck: 'core', topic: 'HTTP', type: 'mcq',
    q: 'Which status code should a server return when a request is valid but the user is not authenticated?',
    choices: ['401 Unauthorized', '403 Forbidden', '400 Bad Request', '404 Not Found'],
    correct: 0,
    a: [
      '401 means "you are not authenticated" — credentials are missing or invalid.',
      '403 means "I know who you are, but you may not do this".',
      '400 means the request itself is malformed. 404 means the resource does not exist.'
    ],
    why: '401 vs 403 is one of the most common API design mistakes. Authentication first, authorisation second.',
    hint: 'Are you unknown, or known and refused?'
  },
  {
    id: 'core-rest', deck: 'core', topic: 'HTTP', type: 'concept',
    q: 'What makes an API RESTful?',
    a: [
      'Resources are identified by URLs, and behaviour comes from HTTP methods (GET, POST, PUT, PATCH, DELETE).',
      'It is stateless: each request carries everything needed, typically a token.',
      'Responses are cacheable where appropriate and use standard status codes and representations (usually JSON).'
    ],
    why: 'REST is an architectural style, not "JSON over HTTP". The statelessness and uniform interface are the substance.',
    hint: 'Resources, methods, statelessness, cacheability.'
  },
  {
    id: 'core-idempotency', deck: 'core', topic: 'HTTP', type: 'concept',
    q: 'Which HTTP methods are idempotent, and why does it matter?',
    a: [
      'GET, HEAD, PUT and DELETE are idempotent: repeating the same request has the same effect as sending it once.',
      'POST is not idempotent, which is why retrying a payment POST can charge twice.',
      'For safe retries on POST, use an idempotency key that the server records and deduplicates.'
    ],
    why: 'Idempotency is the bridge between HTTP and reliable distributed systems.',
    hint: 'Repeat it ten times — is the end state the same?'
  },
  {
    id: 'core-cors', deck: 'core', topic: 'HTTP', type: 'concept',
    q: 'Why does CORS exist, and who enforces it?',
    a: [
      'The browser\'s same-origin policy stops a page on one origin from reading responses from another without permission.',
      'CORS lets the server opt in with Access-Control-Allow-Origin and related headers; the browser then allows the read.',
      'CORS is enforced by the browser, not the server. It is not an authentication mechanism and does not stop curl.'
    ],
    why: 'The misconception that CORS secures an API is extremely common. It protects users from cross-site reads, nothing more.',
    hint: 'Which side has the same-origin policy?'
  },
  {
    id: 'core-cookies-jwt', deck: 'core', topic: 'Auth', type: 'concept',
    q: 'Session cookies vs JWT — what are the trade-offs?',
    a: [
      'Server sessions store state server-side; the cookie is just an opaque id. Revocation is immediate.',
      'JWTs are self-contained and signed, so any service can verify them without a lookup, but revoking one before expiry is hard.',
      'Cookies with HttpOnly, Secure and SameSite are safer against XSS token theft; localStorage JWTs are readable by any script.'
    ],
    why: 'The right answer is usually "it depends on revocation vs statelessness", not a favourite.',
    hint: 'Where does the session state live, and how do you log someone out?'
  },
  {
    id: 'core-https', deck: 'core', topic: 'Networks', type: 'concept',
    q: 'What is the difference between hashing and encryption?',
    a: [
      'Hashing is one-way and fixed-size: you cannot recover the input, and a good hash is collision-resistant.',
      'Encryption is reversible with a key: it protects data in transit or at rest.',
      'Passwords are hashed with a slow algorithm (bcrypt, Argon2) and a salt, never encrypted.'
    ],
    why: 'If you can decrypt passwords, an attacker with the key can too. Hashing is the point.',
    hint: 'Which one is designed to be irreversible?'
  },
  {
    id: 'core-cache-http', deck: 'core', topic: 'HTTP', type: 'concept',
    q: 'What is the difference between Cache-Control: no-store and no-cache?',
    a: [
      'no-store: never persist the response anywhere. Use for sensitive data.',
      'no-cache: you may store it, but you must revalidate with the server before using it.',
      'max-age sets how long a response is fresh without revalidation; ETag plus If-None-Match enables cheap 304 responses.'
    ],
    why: 'The names are misleading: no-cache still caches, it just forces revalidation.',
    hint: 'One forbids storage; the other forbids reuse without checking.'
  },
  {
    id: 'core-latency-numbers', deck: 'core', topic: 'Performance', type: 'concept',
    q: 'Why do engineers memorise latency numbers?',
    a: [
      'Rough orders of magnitude: L1 cache ~1 ns, RAM ~100 ns, SSD read ~100 us, disk seek ~10 ms, cross-continent round trip ~150 ms.',
      'They let you sanity-check designs without benchmarking: 10,000 random disk reads is very different from 10,000 RAM reads.',
      'They also show why batching, caching and avoiding chatty network calls matter so much.'
    ],
    why: 'Interviewers love a candidate who can estimate. "That would be a million round trips" is a strong design argument.',
    hint: 'Cache, memory, SSD, disk, network — each is roughly 10x to 100x the previous.'
  },
  {
    id: 'core-race-condition', deck: 'core', topic: 'Concurrency', type: 'code',
    q: 'Why can this counter lose updates?',
    code: 'class Counter {\n  private int value;\n  void increment() { value++; }\n}',
    a: [
      'value++ is read, add, write — three steps, not one.',
      'Two threads can both read 5, both write 6, and one increment is lost.',
      'Fix with synchronized, an AtomicInteger, or a lock; volatile alone is not enough because it does not make the sequence atomic.'
    ],
    why: 'Check-then-act and read-modify-write are the two patterns to recognise instantly.',
    hint: 'How many CPU-level steps are inside ++?'
  },
  {
    id: 'core-index-selectivity', deck: 'core', topic: 'Databases', type: 'concept',
    q: 'Why might the database ignore an index you created?',
    a: [
      'The predicate is not sargable: wrapping the column in a function, or using leading-wildcard LIKE, prevents a range scan.',
      'The query returns a large fraction of the table, so a sequential scan is cheaper than random index lookups.',
      'Stale statistics, a type mismatch, or a composite index whose leftmost column is not filtered also cause it.'
    ],
    why: 'This is the practical side of indexing and a common debugging task in real systems.',
    hint: 'Can the engine use the sort order of the index for this predicate?'
  },
  {
    id: 'core-consistent-hashing-intro', deck: 'core', topic: 'Distributed', type: 'concept',
    q: 'What problem does consistent hashing solve?',
    a: [
      'With naive modulo hashing, adding or removing one server remaps almost every key, causing a cache stampede.',
      'Consistent hashing places servers and keys on a ring; a key belongs to the next server clockwise.',
      'Adding a server only moves the keys between it and its predecessor, roughly 1/N of the data.'
    ],
    why: 'The motivating pain — mass remapping — is what the interviewer wants to hear before the ring.',
    hint: 'What happens to the mapping when N changes?'
  }
]);
