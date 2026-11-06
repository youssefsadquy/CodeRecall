window.CARDS = (window.CARDS || []).concat([
  {
    id: 'sys-vertical-horizontal', deck: 'sys', topic: 'Scaling', type: 'concept',
    q: 'Vertical vs horizontal scaling — what are the trade-offs?',
    a: [
      'Vertical: a bigger machine. Simple, no code changes, but expensive and capped by hardware.',
      'Horizontal: more machines. Needs stateless services, load balancing and shared state, but scales elastically and tolerates failures.',
      'Most systems scale horizontally at the web tier and vertically for the database until sharding is unavoidable.'
    ],
    why: 'The phrase "stateless services" is the bridge from scaling to almost every other system design topic.',
    hint: 'Bigger box vs more boxes.'
  },
  {
    id: 'sys-load-balancer', deck: 'sys', topic: 'Scaling', type: 'concept',
    q: 'What does a load balancer do, and which algorithm would you choose?',
    a: [
      'It distributes requests across healthy instances and hides failures via health checks.',
      'Round robin for uniform requests; least connections for long-lived or variable-cost requests; consistent hashing when cache locality matters.',
      'It can also terminate TLS and provide a single stable entry point.'
    ],
    why: 'Health checks and session affinity are the follow-up questions; mention both.',
    hint: 'Which server should get the next request, and how do you know it is alive?'
  },
  {
    id: 'sys-stateless', deck: 'sys', topic: 'Scaling', type: 'concept',
    q: 'Why should web servers be stateless?',
    a: [
      'Any instance can serve any request, so you can scale out, restart and replace instances freely.',
      'State moves to a shared store: database, Redis, object storage, or a signed token.',
      'Sticky sessions reduce this benefit and turn a failed instance into lost user state.'
    ],
    why: 'Statelessness is a prerequisite for horizontal scaling and rolling deploys.',
    hint: 'What happens to a user\'s session when the instance dies?'
  },
  {
    id: 'sys-cache-strategies', deck: 'sys', topic: 'Caching', type: 'concept',
    q: 'Compare cache-aside, read-through and write-through caching.',
    a: [
      'Cache-aside: the app checks the cache, loads from the DB on a miss, then fills the cache. Simple and most common.',
      'Read-through: the cache itself loads from the DB on a miss, hiding the logic from the app.',
      'Write-through writes to cache and DB together (consistent, slower); write-behind queues writes (fast, risk of loss).'
    ],
    why: 'Naming the consistency cost of each strategy is what distinguishes a senior answer.',
    hint: 'Who fetches on a miss, and when does the database get written?'
  },
  {
    id: 'sys-cache-invalidation', deck: 'sys', topic: 'Caching', type: 'concept',
    q: 'Why is cache invalidation famously hard?',
    a: [
      'You must know every place a value is cached and invalidate all of them when the source changes.',
      'TTLs bound staleness but do not remove it; explicit invalidation can race with concurrent reads.',
      'The usual compromise is short TTLs for tolerable staleness, plus versioned keys or pub/sub invalidation for critical data.'
    ],
    why: 'The right answer acknowledges the trade-off: freshness vs load vs complexity.',
    hint: 'Stale data vs extra database load.'
  },
  {
    id: 'sys-cdn', deck: 'sys', topic: 'Caching', type: 'concept',
    q: 'What does a CDN do, and what should not be cached at the edge?',
    a: [
      'It caches static and cacheable content at edge locations close to users, cutting latency and origin load.',
      'It also absorbs traffic spikes and can terminate TLS and filter attacks.',
      'Never edge-cache personalised or authenticated responses unless the cache key includes the user and the data is safe to share.'
    ],
    why: 'The cache-key question — what makes two requests the same — is the crux.',
    hint: 'Distance and origin protection, but personal data is dangerous.'
  },
  {
    id: 'sys-replication', deck: 'sys', topic: 'Databases', type: 'concept',
    q: 'What is the difference between leader-follower and multi-leader replication?',
    a: [
      'Leader-follower: all writes go to one leader and stream to followers; reads scale, writes do not.',
      'Multi-leader: several nodes accept writes, improving write availability but requiring conflict resolution.',
      'Leaderless (Dynamo-style) uses quorums: writes and reads must overlap to see the latest value.'
    ],
    why: 'Replication lag and conflict resolution are the consequences to mention.',
    hint: 'How many nodes accept writes?'
  },
  {
    id: 'sys-replication-lag', deck: 'sys', topic: 'Databases', type: 'concept',
    q: 'What problems does replication lag cause?',
    a: [
      'Read-after-write inconsistency: a user writes, then reads from a lagging replica and does not see their change.',
      'Monotonic reads can break: a later read hits a more stale replica and appears to go backwards in time.',
      'Mitigations: read from the leader for critical reads, sticky routing, or wait for a replication position.'
    ],
    why: 'Concrete user-visible anomalies make this answer strong.',
    hint: 'The user writes, then immediately reads from a different node.'
  },
  {
    id: 'sys-sharding', deck: 'sys', topic: 'Databases', type: 'concept',
    q: 'What is sharding, and how do you choose a shard key?',
    a: [
      'Sharding partitions data across independent databases so writes and storage scale horizontally.',
      'A good key spreads load evenly and matches the most common query pattern, so most queries hit one shard.',
      'Bad keys create hotspots (a celebrity user) or force cross-shard joins and distributed transactions.'
    ],
    why: 'Shard-key choice is the whole design. Resharding later is painful, so say that too.',
    hint: 'Even distribution plus query locality.'
  },
  {
    id: 'sys-cap', deck: 'sys', topic: 'Distributed systems', type: 'concept',
    q: 'Explain CAP without the usual misunderstanding.',
    a: [
      'During a network partition, a distributed system must choose consistency (reject or block) or availability (serve possibly stale data).',
      'CAP is about partitions, not normal operation; when the network is healthy you can have both.',
      'Most real systems are effectively CP or AP under partition, and the useful modern framing is PACELC: latency vs consistency even without partitions.'
    ],
    why: 'The common mistake is "pick two of three always". Correct that explicitly.',
    hint: 'The C/A choice only exists while the network is split.'
  },
  {
    id: 'sys-queue', deck: 'sys', topic: 'Messaging', type: 'concept',
    q: 'Why put a message queue between services?',
    a: [
      'Decoupling: the producer does not need the consumer to be up, and each can scale independently.',
      'Buffering: spikes are absorbed instead of overwhelming the consumer.',
      'Retries and ordering: failed work can be retried, and partitions provide ordering within a key.'
    ],
    why: 'Also mention the costs: eventual consistency, duplicate delivery, and operational complexity.',
    hint: 'Temporary mismatch between production and consumption speed.'
  },
  {
    id: 'sys-delivery-semantics', deck: 'sys', topic: 'Messaging', type: 'concept',
    q: 'What is the difference between at-most-once, at-least-once and exactly-once delivery?',
    a: [
      'At-most-once: fire and forget; messages can be lost, never duplicated.',
      'At-least-once: acknowledge after processing; duplicates are possible on retry, so consumers must be idempotent.',
      'Exactly-once is really "effectively once": it needs idempotent processing or transactions, because the network cannot guarantee it alone.'
    ],
    why: 'Most production systems choose at-least-once plus idempotency — say that instead of pretending exactly-once is free.',
    hint: 'Can a message be lost, duplicated, or both?'
  },
  {
    id: 'sys-idempotent-api', deck: 'sys', topic: 'Reliability', type: 'concept',
    q: 'How do you make a payment API safe to retry?',
    a: [
      'Require an idempotency key from the client and store it with the result for a bounded time.',
      'On a repeat with the same key, return the stored result instead of charging again.',
      'The key must be unique per logical operation and scoped to the customer, otherwise one client can replay another\'s request.'
    ],
    why: 'Retries are unavoidable, so idempotency is a correctness requirement, not an optimisation.',
    hint: 'The client retries — how does the server know it is the same operation?'
  },
  {
    id: 'sys-rate-limit', deck: 'sys', topic: 'Reliability', type: 'concept',
    q: 'Compare fixed window, sliding window and token bucket rate limiting.',
    a: [
      'Fixed window counts per interval but allows a burst at the boundary (2x limit).',
      'Sliding window smooths the boundary at the cost of more bookkeeping.',
      'Token bucket refills tokens at a steady rate and allows bursts up to the bucket size; leaky bucket enforces a constant output rate.'
    ],
    why: 'The boundary burst of fixed windows is the detail that shows real understanding.',
    hint: 'What happens at 12:00:00 exactly?'
  },
  {
    id: 'sys-backoff', deck: 'sys', topic: 'Reliability', type: 'concept',
    q: 'Why use exponential backoff with jitter for retries?',
    a: [
      'Backoff spaces retries out so a struggling service is not hammered while it recovers.',
      'Jitter randomises the delay so all clients do not retry in lockstep (the thundering herd).',
      'Cap the delay and limit attempts; retry only transient errors, never validation or auth failures.'
    ],
    why: 'Retrying without limits turns a small outage into a self-inflicted denial of service.',
    hint: 'Many clients failing at once — how do you avoid a synchronised retry storm?'
  },
  {
    id: 'sys-circuit-breaker', deck: 'sys', topic: 'Reliability', type: 'concept',
    q: 'What does a circuit breaker do?',
    a: [
      'It tracks failures to a dependency and opens the circuit, failing fast instead of waiting for timeouts.',
      'After a cooldown it enters half-open and lets a few probes through; success closes it, failure reopens it.',
      'This protects both the caller (threads, latency) and the dependency (reduced load during recovery).'
    ],
    why: 'Fail fast is the core idea: a timeout is still a slow failure.',
    hint: 'Stop calling a broken dependency for a while.'
  },
  {
    id: 'sys-saga', deck: 'sys', topic: 'Distributed systems', type: 'concept',
    q: 'How do you handle a transaction across multiple services?',
    a: [
      'Use a saga: a sequence of local transactions, each with a compensating action for rollback.',
      'Choreography lets services react to events; orchestration uses a central coordinator for visibility.',
      'Accept eventual consistency and design every step to be idempotent and retryable.'
    ],
    why: 'Two-phase commit exists but is slow and fragile; sagas are the practical answer.',
    hint: 'No distributed lock — what undoes a completed step?'
  },
  {
    id: 'sys-monolith-microservices', deck: 'sys', topic: 'Architecture', type: 'concept',
    q: 'When should you start with a monolith instead of microservices?',
    a: [
      'When the domain and team boundaries are still unclear; a monolith lets you refactor cheaply.',
      'When you have few teams and low scale, the operational cost of many services outweighs the benefit.',
      'Split when you have clear bounded contexts, independent scaling needs, and teams that need to deploy independently.'
    ],
    why: 'Microservices solve an organisational scaling problem as much as a technical one.',
    hint: 'What problem are you actually solving: code size or team autonomy?'
  },
  {
    id: 'sys-observability', deck: 'sys', topic: 'Operations', type: 'concept',
    q: 'What are the three pillars of observability?',
    a: [
      'Logs: discrete events with context, best for debugging a specific request.',
      'Metrics: aggregated numbers over time (latency, error rate, saturation), best for alerting and trends.',
      'Traces: the path of one request across services, best for finding which hop is slow.'
    ],
    why: 'Correlating a trace id across logs is the practical answer to "how do you debug production".',
    hint: 'Event, aggregate, and path.'
  },
  {
    id: 'sys-slo', deck: 'sys', topic: 'Operations', type: 'concept',
    q: 'What is the difference between SLI, SLO and SLA?',
    a: [
      'SLI is the measurement: for example the fraction of requests served under 300 ms.',
      'SLO is the internal target for that measurement, such as 99.9% over 30 days.',
      'SLA is the external contract with consequences, usually looser than the SLO. The error budget is 100% minus the SLO.'
    ],
    why: 'Error budgets turn reliability into an engineering decision rather than an argument.',
    hint: 'Measure, target, promise.'
  },
  {
    id: 'sys-url-shortener', deck: 'sys', topic: 'Design exercise', type: 'concept',
    q: 'Design a URL shortener. What are the key decisions?',
    a: [
      'Generate a short unique key, store key to URL in a KV store or database, and redirect with 301 or 302.',
      'Use base62 of a counter or a hash with collision checks; cache hot keys; shard by key.',
      '301 is cacheable and reduces load but hides analytics; 302 keeps every click going through you.'
    ],
    why: 'This is the standard warm-up design. The interesting parts are key generation, redirect semantics and analytics.',
    hint: 'Key generation, storage, redirect, cache.'
  },
  {
    id: 'sys-feed', deck: 'sys', topic: 'Design exercise', type: 'concept',
    q: 'Fan-out on write vs fan-out on read for a social feed — how do you choose?',
    a: [
      'Fan-out on write precomputes each user\'s feed when a post is created: fast reads, expensive writes for users with millions of followers.',
      'Fan-out on read merges posts from followees at read time: cheap writes, slower reads and heavy query work.',
      'A hybrid is standard: push for normal users, pull for celebrities, and merge at read time.'
    ],
    why: 'The celebrity problem is the classic follow-up; a hybrid answer shows judgement.',
    hint: 'When a user with 10 million followers posts, what happens?'
  },
  {
    id: 'sys-consistent-hashing', deck: 'sys', topic: 'Distributed systems', type: 'concept',
    q: 'How does consistent hashing handle hot spots?',
    a: [
      'Map both servers and keys onto a hash ring; a key belongs to the first server clockwise.',
      'Adding or removing a node moves only its share of keys, not everything.',
      'Virtual nodes give each physical server many positions on the ring, smoothing distribution and hot spots.'
    ],
    why: 'Virtual nodes are the detail that separates a memorised answer from an understood one.',
    hint: 'One server, many positions on the ring.'
  },
  {
    id: 'sys-cache-stampede', deck: 'sys', topic: 'Caching', type: 'concept',
    q: 'What is a cache stampede, and how do you prevent it?',
    a: [
      'A popular key expires and thousands of requests miss at once, all hitting the database.',
      'Fixes: request coalescing (one loader per key), a short lock or mutex, and probabilistic early refresh.',
      'Also stagger TTLs with jitter so keys do not all expire together.'
    ],
    why: 'This is the standard failure mode after adding a cache; knowing it signals production experience.',
    hint: 'One hot key expires at the worst possible moment.'
  },
  {
    id: 'sys-db-choice', deck: 'sys', topic: 'Databases', type: 'concept',
    q: 'SQL or NoSQL — how do you decide?',
    a: [
      'Choose SQL when you need relationships, joins, constraints and multi-row transactions.',
      'Choose a document or wide-column store when access patterns are known, the schema is flexible, and you need horizontal write scale.',
      'Do not choose NoSQL to avoid learning schema design; choose it for a specific access pattern and scaling requirement.'
    ],
    why: 'The right framing is access pattern and consistency needs, not "SQL is old".',
    hint: 'What queries will you run, and how much consistency do you need?'
  },
  {
    id: 'sys-single-point', deck: 'sys', topic: 'Reliability', type: 'concept',
    q: 'What is a single point of failure, and how do you remove one?',
    a: [
      'Any component whose failure takes down the whole system: one database, one load balancer, one region.',
      'Add redundancy (replicas, multiple availability zones), health checks and automatic failover.',
      'Redundancy must be independent: two instances on the same host or rack are still one failure domain.'
    ],
    why: 'The failure-domain idea is what makes the answer more than "add a replica".',
    hint: 'If this one thing dies, does everything die?'
  }
]);
