window.CARDS = (window.CARDS || []).concat([
  {
    id: 'js-closures', deck: 'js', topic: 'Closures', type: 'concept', lang: 'js',
    q: 'What is a closure, and why is it useful?',
    a: [
      'A closure is a function that keeps access to the variables of the scope where it was created, even after that scope has returned.',
      'Each call to the outer function creates a fresh closure, which is how you get private per-instance state without classes.',
      'Common uses: callbacks, memoisation, counters, partial application, and state inside React hooks.'
    ],
    code: 'function counter() {\n  let n = 0;              // captured, not copied\n  return () => ++n;\n}\nconst next = counter();\nnext(); // 1\nnext(); // 2',
    why: 'Closures are the mechanism behind module privacy and almost every callback you have written. The inner function holds a reference to the live variable, not a snapshot.',
    hint: 'Think about what happens to a local variable after the function that declared it returns.'
  },
  {
    id: 'js-event-loop', deck: 'js', topic: 'Async & event loop', type: 'code', lang: 'js',
    q: 'What does this print, and in what order?',
    code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
    a: [
      'A, D, C, B.',
      'Synchronous code runs first, so A and D print immediately.',
      'Promises are microtasks: they run after the current task but before the next macrotask.',
      'setTimeout is a macrotask, so B runs only after the microtask queue drains.'
    ],
    why: 'This is the most common JavaScript interview question. The event loop drains the microtask queue completely after every task.',
    hint: 'Two queues: microtasks (promises) and macrotasks (timers). Which is drained first?'
  },
  {
    id: 'js-equality', deck: 'js', topic: 'Types & coercion', type: 'mcq',
    q: 'Which comparison evaluates to true?',
    choices: ["'5' == 5", "'5' === 5", 'null === undefined', 'NaN === NaN'],
    correct: 0,
    a: [
      "'5' == 5 is true — loose equality coerces the string to a number.",
      '=== is strict: no coercion, so both `\'5\' === 5` and `null === undefined` are false.',
      'NaN is never equal to itself; use Number.isNaN(x).'
    ],
    why: 'Default to === and only use == when you deliberately want null and undefined to match (x == null). It removes a whole class of bugs.',
    hint: 'Loose equality converts types; strict equality does not.'
  },
  {
    id: 'js-var-let-const', deck: 'js', topic: 'Scope & declarations', type: 'concept', lang: 'js',
    q: 'What is the difference between var, let and const?',
    a: [
      'var is function-scoped and hoisted as undefined; let and const are block-scoped.',
      'let and const sit in a temporal dead zone from the start of the block until the declaration runs, so access before it throws.',
      'const prevents rebinding the name, not mutating the object it points to.'
    ],
    code: "if (true) {\n  var a = 1;\n  let b = 2;\n}\nconsole.log(a); // 1\nconsole.log(b); // ReferenceError\n\nconst user = { name: 'Sam' };\nuser.name = 'Alex'; // allowed\nuser = {};          // TypeError",
    why: 'Block scoping is what makes loops and conditional logic safe. Use const by default, let when you must reassign, and treat var as legacy.',
    hint: 'Ask: which scope does the binding belong to, and when is it initialised?'
  },
  {
    id: 'js-this', deck: 'js', topic: 'this & binding', type: 'code', lang: 'js',
    q: 'What do the two calls log?',
    code: "const obj = {\n  name: 'obj',\n  regular() { return this.name; },\n  arrow: () => this.name\n};\nconsole.log(obj.regular());\nconsole.log(obj.arrow());",
    a: [
      "obj.regular() logs 'obj': a regular function's this is set by how it is called.",
      "obj.arrow() does not get this from obj. Arrow functions capture this lexically, so here it is the module/global this — undefined in strict modules.",
      'bind, call and apply can set this for regular functions only; they cannot change an arrow function.'
    ],
    why: 'Most "this is undefined" bugs are an arrow function used as a method, or a method passed as a callback without bind.',
    hint: 'Arrow functions do not have their own this. Look at where the function was written, not where it is called.'
  },
  {
    id: 'js-prototype', deck: 'js', topic: 'Prototypes', type: 'concept', lang: 'js',
    q: 'How does property lookup work on a JavaScript object?',
    a: [
      'The engine checks the object itself, then walks its prototype chain until it finds the property or reaches null.',
      'Object.create(proto) and class syntax both build that chain; methods live on the prototype, not on every instance.',
      'Own properties shadow prototype properties. Object.hasOwn(obj, key) checks only the object itself.'
    ],
    code: "const animal = { speak() { return '...'; } };\nconst dog = Object.create(animal);\ndog.speak = () => 'woof';\n\ndog.speak();          // 'woof' (own)\nanimal.speak();       // '...'\nObject.hasOwn(dog, 'speak'); // true",
    why: 'Prototypes explain inheritance, memory sharing of methods, and why adding a method to a prototype instantly affects existing instances.',
    hint: 'Lookup walks a chain of links, ending at null.'
  },
  {
    id: 'js-array-methods', deck: 'js', topic: 'Arrays', type: 'code', lang: 'js',
    q: 'What is returned here?',
    code: 'const nums = [1, 2, 3, 4];\nconst out = nums\n  .filter(n => n % 2 === 0)\n  .map(n => n * 10)\n  .reduce((sum, n) => sum + n, 0);',
    a: [
      'out is 60: filter keeps 2 and 4, map turns them into 20 and 40, reduce sums them.',
      'filter and map return new arrays; reduce collapses to a single value.',
      'Forgetting the initial value in reduce makes it use the first element as the accumulator — 0 here prevents that.'
    ],
    why: 'Chained array methods are the everyday vocabulary of JS data transformation. Knowing what each returns prevents accidental mutation.',
    hint: 'Evaluate one method at a time, left to right.'
  },
  {
    id: 'js-sort-mutates', deck: 'js', topic: 'Arrays', type: 'code', lang: 'js',
    q: 'What does this log?',
    code: "const scores = [10, 9, 1];\nconst sorted = scores.sort();\nconsole.log(sorted);\nconsole.log(scores);",
    a: [
      'Both log [1, 10, 9].',
      'sort() converts elements to strings and compares them lexicographically by default, so "10" comes before "9".',
      'It also mutates the original array. Pass a comparator for numbers and copy first: [...scores].sort((a, b) => a - b).'
    ],
    why: 'The default sort is a classic production bug. Numeric data needs a comparator, and immutability needs a copy (or toSorted in modern runtimes).',
    hint: 'Default sort compares strings, and it changes the array in place.'
  },
  {
    id: 'js-shallow-copy', deck: 'js', topic: 'Immutability', type: 'code', lang: 'js',
    q: 'Why does editing the copy also change the original?',
    code: 'const original = { user: { name: "Sam" } };\nconst copy = { ...original };\ncopy.user.name = "Alex";\nconsole.log(original.user.name);',
    a: [
      'It logs "Alex". Spread copies the top level only; both objects share the same nested user reference.',
      'This is a shallow copy. structuredClone(original) or an explicit nested copy is needed for deep data.',
      'In React, shallow copies are often intentional — but updating nested state requires copying each changed level.'
    ],
    why: 'Most "my state changed by itself" bugs are shared nested references. Know the depth of your copy.',
    hint: 'Spread copies references, not the objects those references point to.'
  },
  {
    id: 'js-async-await', deck: 'js', topic: 'Async & event loop', type: 'concept', lang: 'js',
    q: 'How do you handle errors with async/await?',
    a: [
      'Wrap awaits in try/catch; a rejected promise becomes a thrown error at the await.',
      'A returned promise that you never await or .catch() becomes an unhandled rejection.',
      'For independent work, start promises first and await later — awaiting sequentially inside a loop serialises it.'
    ],
    code: 'async function load() {\n  try {\n    const res = await fetch("/api/user");\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    console.error("load failed", err);\n    throw err;\n  }\n}',
    why: 'fetch only rejects on network failure, not on 4xx/5xx — checking res.ok is mandatory.',
    hint: 'A non-2xx HTTP response is still a resolved fetch promise.'
  },
  {
    id: 'js-promise-combinators', deck: 'js', topic: 'Async & event loop', type: 'mcq',
    q: 'You need every result, and one failed request must not discard the others. Which combinator?',
    choices: ['Promise.all', 'Promise.allSettled', 'Promise.race', 'Promise.any'],
    correct: 1,
    a: [
      'Promise.allSettled waits for all and gives each result as fulfilled or rejected.',
      'Promise.all rejects as soon as any one rejects — the others still run but their results are lost.',
      'Promise.race settles with the first to settle; Promise.any resolves on the first success.'
    ],
    why: 'For dashboards and batch jobs, allSettled lets you show partial success instead of a single all-or-nothing failure.',
    hint: 'Which one never rejects?'
  },
  {
    id: 'js-debounce', deck: 'js', topic: 'Patterns', type: 'code', lang: 'js',
    q: 'What does this function do, and when would you use it?',
    code: 'function debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}',
    a: [
      'It delays fn until calls have stopped for ms milliseconds; only the last call in a burst runs.',
      'Use it for search-as-you-type, resize handlers and validation — work you only need once the user pauses.',
      'Throttle is different: it runs at most once per interval while the event keeps firing.'
    ],
    why: 'A debounce is a closure plus a timer — one of the clearest examples of why closures matter in real code.',
    hint: 'Does it run on every event, the first, or the last?'
  },
  {
    id: 'js-typeof-null', deck: 'js', topic: 'Types & coercion', type: 'concept',
    q: 'Why does typeof null return "object", and how do you check for null and arrays?',
    a: [
      'typeof null returning "object" is a historical bug kept for backwards compatibility.',
      'Check null explicitly with value === null; check arrays with Array.isArray(value).',
      'typeof an undeclared variable is "undefined" and does not throw, but typeof of most other values is coarse ("object" for dates and arrays too).'
    ],
    why: 'Defensive type checks matter more in JS than in typed languages. Use the precise predicate, not typeof alone.',
    hint: 'null is a deliberate absence; undefined means not assigned.'
  },
  {
    id: 'js-hoisting', deck: 'js', topic: 'Scope & declarations', type: 'code', lang: 'js',
    q: 'What happens when this runs?',
    code: 'sayHi();\nconsole.log(x);\nvar x = 1;\n\nfunction sayHi() {\n  console.log("hi");\n}',
    a: [
      'It prints "hi", then undefined, then assigns 1.',
      'Function declarations are fully hoisted, so they are callable before their line.',
      'var declarations are hoisted but initialised as undefined; let/const would be in the temporal dead zone and throw.'
    ],
    why: 'Hoisting explains a lot of confusing early errors. The practical rule: declare before use and prefer const.',
    hint: 'The declaration is hoisted; the assignment is not.'
  },
  {
    id: 'js-nan', deck: 'js', topic: 'Types & coercion', type: 'concept',
    q: 'How do you test for NaN, and when does it appear?',
    a: [
      'Use Number.isNaN(value). The global isNaN coerces first, so isNaN("abc") is true.',
      'NaN appears from invalid arithmetic, Number("abc"), and undefined math — and it poisons every later calculation.',
      'Object.is(NaN, NaN) is true; NaN === NaN is false.'
    ],
    why: 'Silent NaN propagation in financial or metrics code is a real bug class. Validate numbers at the boundary.',
    hint: 'Prefer the Number.isNaN variant: no coercion.'
  },
  {
    id: 'js-modules', deck: 'js', topic: 'Modules', type: 'concept',
    q: 'What is the difference between ES modules and CommonJS?',
    a: [
      'ES modules use import/export, are statically analysable, and are the standard in browsers and modern Node.',
      'CommonJS uses require/module.exports, loads synchronously, and is the older Node format.',
      'ES module imports are live bindings and hoisted; CommonJS exports are a copied object at require time.'
    ],
    why: 'Mixing the two causes confusing `default` interop bugs. Modern projects should default to ESM.',
    hint: 'One is static and standard; the other is Node’s original synchronous loader.'
  },
  {
    id: 'js-ts-unknown', deck: 'js', topic: 'TypeScript', type: 'concept', lang: 'ts',
    q: 'When should you use unknown instead of any?',
    a: [
      'unknown accepts any value but forces you to narrow it before use — it is the type-safe top type.',
      'any disables checking for that value and spreads silently through your code.',
      'Use unknown for untrusted input (JSON, catch errors, API payloads), then validate or narrow.'
    ],
    code: 'function parse(input: unknown) {\n  if (typeof input === "string") {\n    return input.trim(); // narrowed\n  }\n  throw new Error("expected string");\n}',
    why: 'unknown keeps the compiler on your side at trust boundaries; any turns it off exactly where bugs enter.',
    hint: 'One of them requires proof before you can use the value.'
  },
  {
    id: 'js-ts-generics', deck: 'js', topic: 'TypeScript', type: 'code', lang: 'ts',
    q: 'What does the generic add here?',
    code: 'function first<T>(items: T[]): T | undefined {\n  return items[0];\n}\n\nconst n = first([1, 2, 3]); // number | undefined\nconst s = first(["a"]);     // string | undefined',
    a: [
      'T is inferred from the argument, so the return type follows the input instead of being any or a fixed type.',
      'It preserves the relationship between input and output — the type is not lost.',
      'Use a constraint when you need properties: <T extends { id: string }>.'
    ],
    why: 'Generics let one implementation stay type-safe across many types. The win is inference, not just reusable syntax.',
    hint: 'Look at what type the caller passes in, and what type comes back.'
  },
  {
    id: 'js-ts-narrowing', deck: 'js', topic: 'TypeScript', type: 'code', lang: 'ts',
    q: 'Why is the else branch narrowed to string?',
    code: 'function pad(value: string | number) {\n  if (typeof value === "number") {\n    return value.toFixed(2);\n  }\n  return value.trim();\n}',
    a: [
      'TypeScript tracks control flow: inside the if, value is number; in the else, the number case is eliminated.',
      'typeof, instanceof, in, equality with literals and user-defined type predicates all narrow.',
      'Narrowing is why discriminated unions with a `kind` field work so well.'
    ],
    why: 'Narrowing is the everyday core of TypeScript. If you fight the compiler, you are usually missing a narrowing check.',
    hint: 'The compiler removes possibilities it has already ruled out.'
  },
  {
    id: 'js-ts-interface-type', deck: 'js', topic: 'TypeScript', type: 'concept',
    q: 'Interface or type alias — what is the practical difference?',
    a: [
      'Both can describe object shapes; interfaces can be declaration-merged and extended with `extends`.',
      'Type aliases can express unions, intersections, tuples and mapped types; interfaces cannot be a union.',
      'Team conventions matter more than the small differences. Prefer interface for public object APIs, type for composed logic.'
    ],
    why: 'Interviewers ask this to see whether you understand composition and declaration merging, not to catch a syntax preference.',
    hint: 'Which one can represent a union?'
  },
  {
    id: 'js-react-stale', deck: 'js', topic: 'React', type: 'code', lang: 'js',
    q: 'Why does count stay at 0 inside this interval?',
    code: 'function Counter() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => {\n      console.log(count);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n}',
    a: [
      'The effect runs once, so the callback closes over the first render\'s count — a stale closure.',
      'Use the functional update setCount(c => c + 1) when the next state depends on the previous.',
      'Or add count to the dependency array (recreating the interval on every change).'
    ],
    why: 'Stale closures are the most common React bug after missing dependencies. The state you read is from the render that created the function.',
    hint: 'Which render created the function that the interval is running?'
  },
  {
    id: 'js-react-effect', deck: 'js', topic: 'React', type: 'concept',
    q: 'What does the cleanup function in useEffect do?',
    a: [
      'It runs before the effect runs again, and once on unmount — cancelling subscriptions, timers and requests.',
      'For data fetching, use an AbortController and abort in cleanup to prevent out-of-order responses.',
      'The dependency array controls when the effect re-runs; an empty array means only after mount (in development, twice under StrictMode).'
    ],
    code: 'useEffect(() => {\n  const ctrl = new AbortController();\n  fetch("/api/items", { signal: ctrl.signal })\n    .then(r => r.json())\n    .then(setItems)\n    .catch(e => { if (e.name !== "AbortError") setError(e); });\n  return () => ctrl.abort();\n}, []);',
    why: 'Without cleanup, fast navigation leaves requests and timers writing into unmounted components — a classic memory-leak source.',
    hint: 'Cleanup runs before every re-run, not only at unmount.'
  },
  {
    id: 'js-react-keys', deck: 'js', topic: 'React', type: 'concept',
    q: 'Why does React need keys in a list?',
    a: [
      'Keys let React match elements between renders so it can preserve state and move DOM nodes instead of recreating them.',
      'Use a stable identity from the data (id), not the array index when items can reorder or be inserted.',
      'Index keys cause inputs and animation state to jump to the wrong row after insertion or deletion.'
    ],
    why: 'Keys are about identity, not to silence a warning. Wrong keys create subtle state bugs that are hard to reproduce.',
    hint: 'What happens to component state when the list order changes?'
  },
  {
    id: 'js-delegation', deck: 'js', topic: 'DOM', type: 'concept', lang: 'js',
    q: 'What is event delegation and why is it useful?',
    a: [
      'Attach one listener to a parent and use event.target.closest(selector) to find the clicked child.',
      'It works for elements added later, and uses less memory than one listener per item.',
      'For click-outside handling, check whether the event target is inside the container.'
    ],
    code: 'list.addEventListener("click", (e) => {\n  const row = e.target.closest("[data-id]");\n  if (!row) return;\n  select(row.dataset.id);\n});',
    why: 'Delegation is the backbone of efficient list UIs and dynamic content. It also survives re-renders.',
    hint: 'One listener on the container, bubbling from the child.'
  },
  {
    id: 'js-optional-chaining', deck: 'js', topic: 'Types & coercion', type: 'concept', lang: 'js',
    q: 'What is the difference between ?. and ??.',
    a: [
      'a?.b short-circuits property access when a is null or undefined, returning undefined.',
      'a ?? b returns b only when a is null or undefined — not when a is 0, false or "".',
      'Compare with ||, which also falls back on any falsy value.'
    ],
    code: 'const port = config.port ?? 3000; // 0 stays 0\nconst label = user?.name ?? "guest";',
    why: 'Using || for defaults silently breaks legitimate 0 and empty-string values. ?? was added for exactly that case.',
    hint: 'One guards access; the other picks a fallback.'
  },
  {
    id: 'js-map-vs-object', deck: 'js', topic: 'Collections', type: 'concept',
    q: 'When is a Map better than a plain object?',
    a: [
      'Map keys can be any value, including objects; object keys are strings or symbols.',
      'Map preserves insertion order reliably and has size, has, delete and iteration built in.',
      'Use objects for fixed record shapes and JSON; use Map for dynamic lookup tables and caching.'
    ],
    why: 'Strings-only keys are a real limitation for caches keyed by objects. Map also avoids prototype-key collisions like "constructor".',
    hint: 'What can be a key in each?'
  },
  {
    id: 'js-for-of-in', deck: 'js', topic: 'Arrays', type: 'concept',
    q: 'When do you use for...of versus for...in?',
    a: [
      'for...of iterates values of any iterable (arrays, strings, Map, Set) — usually what you want.',
      'for...in iterates enumerable property names, including inherited ones — intended for objects, risky for arrays.',
      'for...in on an array gives string indices and can include extra properties; prefer for...of or forEach.'
    ],
    why: 'This distinction shows up in interviews and in real bugs when array prototypes are extended.',
    hint: 'One gives values; the other gives keys.'
  },
  {
    id: 'js-structured-clone', deck: 'js', topic: 'Immutability', type: 'concept',
    q: 'Why not deep-clone with JSON.parse(JSON.stringify(x))?',
    a: [
      'It silently drops functions, undefined, symbols and prototypes, and turns Date into a string.',
      'It throws on circular references.',
      'structuredClone(x) handles Date, Map, Set, ArrayBuffer and cycles; it still cannot clone functions.'
    ],
    why: 'JSON cloning is a common shortcut that causes mysterious data loss. structuredClone is the modern built-in.',
    hint: 'Consider Date, undefined and circular objects.'
  },
  {
    id: 'js-currying', deck: 'js', topic: 'Patterns', type: 'code', lang: 'js',
    q: 'What is currying, and how does this helper demonstrate it?',
    code: 'const add = a => b => a + b;\nconst add10 = add(10);\nadd10(5); // 15',
    a: [
      'Currying turns a function of several arguments into a chain of functions that each take one.',
      'It lets you create specialised functions like add10 by fixing the earlier arguments.',
      'Related: partial application fixes some arguments now and supplies the rest later.'
    ],
    why: 'Currying is the foundation of function composition and appears throughout functional programming and middleware design.',
    hint: 'Every arrow returns the next function until all arguments are supplied.'
  },
  {
    id: 'js-array-mutation', deck: 'js', topic: 'Arrays', type: 'concept',
    q: 'Which common array methods mutate the original?',
    a: [
      'Mutating: push, pop, shift, unshift, splice, sort, reverse, fill, copyWithin.',
      'Non-mutating: map, filter, slice, concat, flat, find, some, every, reduce.',
      'Modern alternatives return copies: toSorted, toReversed, toSpliced, with.'
    ],
    why: 'Accidentally mutating shared state is one of the most common React and Redux bugs. Know which side of the line each method is on.',
    hint: 'push/splice/sort change the array; map/filter/slice do not.'
  }
]);
