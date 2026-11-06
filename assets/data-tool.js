window.CARDS = (window.CARDS || []).concat([
  {
    id: 'tool-merge-rebase', deck: 'tool', topic: 'Git', type: 'concept',
    q: 'Merge vs rebase — what is the difference and when do you use each?',
    a: [
      'Merge combines histories and creates a merge commit, preserving exactly what happened.',
      'Rebase replays your commits on top of another branch, producing a clean linear history but rewriting commit hashes.',
      'Rebase your own unpushed feature branch before opening a PR; merge shared branches. Never rebase a branch others have pulled.'
    ],
    why: 'The golden rule — do not rewrite shared history — is the answer interviewers look for.',
    hint: 'Preserve history or make it linear?'
  },
  {
    id: 'tool-reset-revert', deck: 'tool', topic: 'Git', type: 'code',
    q: 'What is the difference between git reset and git revert?',
    code: 'git reset --soft HEAD~1   # undo commit, keep changes staged\ngit reset --mixed HEAD~1  # undo commit, keep changes unstaged\ngit reset --hard HEAD~1   # destroy commit and changes\n\ngit revert <sha>          # new commit that undoes <sha>',
    a: [
      'reset moves the branch pointer; it rewrites local history and is dangerous after pushing.',
      'revert creates a new commit that reverses the change, which is safe for shared history.',
      '--soft, --mixed and --hard control how much of the working tree is preserved.'
    ],
    why: 'Reset is for local cleanup, revert is for already-published mistakes.',
    hint: 'Rewrite the past, or add a corrective commit?'
  },
  {
    id: 'tool-reflog', deck: 'tool', topic: 'Git', type: 'concept',
    q: 'You accidentally ran git reset --hard and lost commits. What now?',
    a: [
      'Run git reflog to see every position HEAD has had, including the commit before the reset.',
      'Reset back to that hash, or create a branch at it.',
      'Reflog entries are local and expire after a while, so act quickly and avoid aggressive garbage collection.'
    ],
    why: 'Reflog is Git\'s safety net. Almost nothing committed is truly lost immediately.',
    hint: 'Git records where HEAD has been.'
  },
  {
    id: 'tool-bisect', deck: 'tool', topic: 'Debugging', type: 'concept',
    q: 'How does git bisect find a regression?',
    a: [
      'Mark a known good commit and a known bad commit, and Git checks out the midpoint.',
      'You run the test and mark it good or bad, halving the range each time: O(log n) builds.',
      'git bisect run automates it with a script, and the first bad commit is reported at the end.'
    ],
    why: 'This is the fastest way to find a regression across hundreds of commits, and it is a great interview story.',
    hint: 'Binary search over commits.'
  },
  {
    id: 'tool-cherry-pick', deck: 'tool', topic: 'Git', type: 'concept',
    q: 'What does git cherry-pick do, and when is it risky?',
    a: [
      'It applies the change from one or more commits onto the current branch, creating new commits with new hashes.',
      'Use it to backport a specific fix to a release branch.',
      'It is risky when the commit depends on other changes, because you take the diff without its context and can get conflicts or broken code.'
    ],
    why: 'The dependency caveat is what separates a real answer from a definition.',
    hint: 'Copy one commit without its history.'
  },
  {
    id: 'tool-branch-strategy', deck: 'tool', topic: 'Git', type: 'concept',
    q: 'Trunk-based development vs Git Flow — what is the trade-off?',
    a: [
      'Trunk-based: short-lived branches merged into main frequently, with feature flags for incomplete work. Fast integration, fewer merge conflicts.',
      'Git Flow: long-lived develop, release and feature branches. More ceremony, suited to scheduled releases.',
      'Most modern teams lean trunk-based with CI and feature flags; continuous integration only works when branches are short.'
    ],
    why: 'The real variable is integration frequency, not branch naming.',
    hint: 'How long does a branch live before it merges?'
  },
  {
    id: 'tool-test-pyramid', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'What is the testing pyramid?',
    a: [
      'Many fast unit tests at the base, fewer integration tests in the middle, very few end-to-end tests at the top.',
      'Unit tests localise failures and run in milliseconds; E2E tests prove the whole system but are slow and flaky.',
      'Aim for confidence per second of runtime, not a coverage number.'
    ],
    why: 'The shape is about feedback speed and failure localisation, not dogma.',
    hint: 'Many cheap tests, few expensive ones.'
  },
  {
    id: 'tool-unit-integration', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'What is the difference between a unit test and an integration test?',
    a: [
      'A unit test exercises one unit in isolation with collaborators replaced by fakes; failures point at that unit.',
      'An integration test exercises real components together: database, HTTP layer, message broker.',
      'The distinction that matters is what is real, not how many classes are involved.'
    ],
    why: '"Unit" is defined by isolation boundaries, not by file count.',
    hint: 'Is the database real or fake?'
  },
  {
    id: 'tool-tdd', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'What is the TDD cycle?',
    a: [
      'Red: write a failing test for the next small behaviour.',
      'Green: write the simplest code that passes.',
      'Refactor: clean up with the test as a safety net, then repeat.'
    ],
    why: 'TDD is a design technique as much as a testing one: writing the test first forces a usable interface.',
    hint: 'Fail, pass, clean.'
  },
  {
    id: 'tool-mocks', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'What is the difference between a stub, a mock and a fake?',
    a: [
      'Stub: returns canned answers and does not verify anything.',
      'Mock: records calls and lets you assert interactions happened.',
      'Fake: a working lightweight implementation, such as an in-memory repository.'
    ],
    why: 'Overusing mocks couples tests to implementation. Prefer fakes for behaviour and assert on outcomes.',
    hint: 'Canned answer, call expectation, or working stand-in.'
  },
  {
    id: 'tool-flaky', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'What causes flaky tests, and how do you fix them?',
    a: [
      'Time and timezone dependence, real network calls, shared state between tests, and timing sleeps.',
      'Unordered collections, random data without a seed, and async work that is not awaited also cause intermittent failures.',
      'Fix by controlling time, isolating state, replacing network with fakes, and waiting on conditions rather than fixed sleeps.'
    ],
    why: 'A flaky test is worse than no test because the team learns to ignore red builds.',
    hint: 'What is non-deterministic in the test?'
  },
  {
    id: 'tool-coverage', deck: 'tool', topic: 'Testing', type: 'concept',
    q: 'Is 100% code coverage a good goal?',
    a: [
      'Coverage measures which lines ran, not whether behaviour was asserted.',
      'You can hit 100% with no assertions, and you can miss critical edge cases while covering every line.',
      'Use coverage to find untested areas, then write meaningful assertions around risky behaviour, not to chase a number.'
    ],
    why: 'The line-executed vs asserted distinction is the point.',
    hint: 'Does the test actually check anything?'
  },
  {
    id: 'tool-ci-cd', deck: 'tool', topic: 'CI/CD', type: 'concept',
    q: 'What is the difference between continuous integration, delivery and deployment?',
    a: [
      'CI: every change is merged frequently and automatically built and tested.',
      'Continuous delivery: every passing change is deployable to production, but a human may press the button.',
      'Continuous deployment: every passing change goes to production automatically.'
    ],
    why: 'The distinction is who decides to release, not whether automation exists.',
    hint: 'Automatic build, automatic readiness, automatic release.'
  },
  {
    id: 'tool-docker', deck: 'tool', topic: 'Docker', type: 'concept',
    q: 'What problem does Docker solve?',
    a: [
      'It packages an application with its runtime and dependencies into an image, so it runs the same everywhere.',
      'Containers share the host kernel and isolate processes, making them lighter than virtual machines.',
      'It also standardises build and deployment, which is why CI and orchestration platforms build around images.'
    ],
    why: 'The "works on my machine" problem is the one-sentence answer.',
    hint: 'Package code plus its environment.'
  },
  {
    id: 'tool-dockerfile', deck: 'tool', topic: 'Docker', type: 'code',
    q: 'Why does the order of these Dockerfile lines matter?',
    code: 'COPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nCMD ["node", "dist/server.js"]',
    a: [
      'Docker caches each layer. Dependency installation is only re-run when package files change.',
      'Because source is copied after npm ci, editing a source file does not invalidate the dependency layer.',
      'Copying everything first would bust the cache on every code change and make builds much slower.'
    ],
    why: 'Layer caching is the single biggest Docker build optimisation.',
    hint: 'Which layer changes most often?'
  },
  {
    id: 'tool-multistage', deck: 'tool', topic: 'Docker', type: 'concept',
    q: 'What is a multi-stage Docker build for?',
    a: [
      'Build in one stage with compilers and dev dependencies, then copy only the output into a small runtime stage.',
      'The final image stays small and has a smaller attack surface because build tools are not shipped.',
      'Example: a Go or .NET build stage followed by a slim runtime image.'
    ],
    why: 'Smaller images mean faster pulls and fewer vulnerabilities.',
    hint: 'Build heavy, ship light.'
  },
  {
    id: 'tool-12factor', deck: 'tool', topic: 'Architecture', type: 'concept',
    q: 'What does 12-factor "config in the environment" mean?',
    a: [
      'Configuration that varies between deployments — credentials, URLs, feature toggles — lives in environment variables, not in code.',
      'The same build artifact can then run in dev, staging and production.',
      'Secrets still need a secrets manager; environment variables are the delivery mechanism, not a security guarantee.'
    ],
    why: 'One build, many environments is the principle; leaking secrets into images is the anti-pattern.',
    hint: 'Same artifact, different environment.'
  },
  {
    id: 'tool-feature-flags', deck: 'tool', topic: 'Delivery', type: 'concept',
    q: 'Why use feature flags?',
    a: [
      'They decouple deploy from release, so incomplete code can merge to main safely.',
      'They enable canaries, gradual rollouts, kill switches and per-user targeting.',
      'Flags are debt: remove them after rollout, or the code fills with dead branches and untested combinations.'
    ],
    why: 'The cleanup rule is the part teams forget and interviewers like to hear.',
    hint: 'Ship code without turning it on.'
  },
  {
    id: 'tool-logging', deck: 'tool', topic: 'Observability', type: 'concept',
    q: 'What should a good log line contain?',
    a: [
      'Timestamp, level, service, and a message describing what happened.',
      'Structured fields rather than string concatenation: request id, user id, route, latency, status.',
      'Never log secrets, tokens or full personal data; logs are widely readable and retained.'
    ],
    why: 'Structured logs are searchable; string blobs are not. The correlation id is what ties a request together.',
    hint: 'Machine-parseable fields, not prose.'
  },
  {
    id: 'tool-semver', deck: 'tool', topic: 'Versioning', type: 'concept',
    q: 'What do the three numbers in semantic versioning mean?',
    a: [
      'MAJOR.MINOR.PATCH: major for breaking changes, minor for backward-compatible features, patch for backward-compatible fixes.',
      'Consumers can safely take patch and minor updates if they trust the contract.',
      'Below 1.0.0, the API is considered unstable, so minor versions may break.'
    ],
    why: 'Semver is a communication contract, and it only works if breaking changes are honest.',
    hint: 'Break, add, fix.'
  },
  {
    id: 'tool-code-review', deck: 'tool', topic: 'Craft', type: 'concept',
    q: 'What should you look for in a code review?',
    a: [
      'Correctness first: edge cases, error handling, concurrency, and whether tests actually prove the behaviour.',
      'Then design: naming, boundaries, duplication, and whether the change fits existing patterns.',
      'Then security and performance risks. Style should be automated by a formatter, not debated by humans.'
    ],
    why: 'Reviewing in priority order keeps feedback useful and avoids nitpicking.',
    hint: 'Correct, then clear, then fast.'
  },
  {
    id: 'tool-debugging', deck: 'tool', topic: 'Debugging', type: 'concept',
    q: 'How do you debug a production issue you cannot reproduce locally?',
    a: [
      'Stabilise first: check dashboards, roll back if the blast radius is growing, and preserve evidence.',
      'Form a hypothesis from logs, traces and metrics, then narrow with the timestamps and affected users.',
      'Reproduce with the real inputs or a targeted test, fix, and add a regression test plus an alert.'
    ],
    why: 'The order matters: mitigate before you investigate, and finish with prevention.',
    hint: 'Stop the bleeding, then find the cause.'
  },
  {
    id: 'tool-profiling', deck: 'tool', topic: 'Performance', type: 'concept',
    q: 'How do you approach a performance problem?',
    a: [
      'Measure first: define the metric and reproduce under realistic load.',
      'Profile to find the actual bottleneck — CPU, memory, I/O or lock contention — instead of guessing.',
      'Optimise the dominant cost, then re-measure; keep a benchmark so the improvement does not regress.'
    ],
    why: 'Premature optimisation without measurement usually makes code worse.',
    hint: 'Measure, profile, fix the biggest cost, repeat.'
  },
  {
    id: 'tool-package-lock', deck: 'tool', topic: 'Dependencies', type: 'concept',
    q: 'Why commit a lockfile?',
    a: [
      'It pins the exact resolved versions and hashes of the whole dependency tree.',
      'Without it, two installs on different days can produce different builds.',
      'It makes CI reproducible and lets security tooling detect the exact vulnerable version.'
    ],
    why: 'Reproducible builds are the goal; the lockfile is how you get them.',
    hint: 'Same input, same output, every time.'
  },
  {
    id: 'tool-gitignore', deck: 'tool', topic: 'Git', type: 'concept',
    q: 'What should never be committed to a repository?',
    a: [
      'Secrets and credentials, build output, dependency folders, local environment files and large binaries.',
      'Anything generated should be reproducible from source; anything private should be injected at runtime.',
      'If a secret is committed, rotate it — history rewrites do not undo exposure.'
    ],
    why: 'The rotate rule is the important one; people focus on deleting the commit instead.',
    hint: 'Generated, private, or huge.'
  }
]);
