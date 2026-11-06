window.CARDS = (window.CARDS || []).concat([
  {
    id: 'jvm-oop-pillars', deck: 'jvm', topic: 'OOP', type: 'concept',
    q: 'What are the four pillars of OOP, and what does each actually buy you?',
    a: [
      'Encapsulation: hide state behind behaviour so invariants cannot be broken from outside.',
      'Abstraction: expose a simple model and hide the machinery (an interface or abstract type).',
      'Inheritance: reuse and specialise behaviour through an is-a relationship.',
      'Polymorphism: one call site, many implementations, chosen at runtime by the object type.'
    ],
    why: 'Interviews rarely want definitions — they want you to connect each pillar to a consequence: safer invariants, replaceable implementations, and code that does not need editing when a new type appears.',
    hint: 'For each one, name a bug it prevents.'
  },
  {
    id: 'jvm-interface-abstract', deck: 'jvm', topic: 'OOP', type: 'concept',
    q: 'When do you choose an interface over an abstract class?',
    a: [
      'An interface is a pure contract. A class can implement many interfaces, so it is the default for capabilities and for depending on abstractions.',
      'An abstract class can hold state and shared implementation, but a class can extend only one.',
      'Rule of thumb: interface for what something can do, abstract class for partial shared machinery when a common base genuinely exists.'
    ],
    why: 'The choice is really about coupling. Interfaces keep callers independent of implementation; abstract bases are convenient but lock the hierarchy.',
    hint: 'Count how many of each a class is allowed to take.'
  },
  {
    id: 'jvm-composition', deck: 'jvm', topic: 'OOP', type: 'concept',
    q: 'Why is composition usually preferred over inheritance?',
    a: [
      'Inheritance couples you to the parent implementation forever and breaks encapsulation (the fragile base class problem).',
      'Composition lets you assemble behaviour from small parts and swap them at runtime.',
      'Use inheritance only for a true is-a with a stable contract; use composition for has-a and for code reuse.'
    ],
    why: 'Deep hierarchies are where "change one class, break five" bugs live. Most refactorings move from inheritance to delegation for exactly this reason.',
    hint: 'Which relationship survives change better: is-a or has-a?'
  },
  {
    id: 'jvm-equals-hash', deck: 'jvm', topic: 'Object contracts', type: 'code', lang: 'java',
    q: 'Why must equals and hashCode be overridden together?',
    code: 'class Point {\n  final int x, y;\n  Point(int x, int y) { this.x = x; this.y = y; }\n\n  @Override public boolean equals(Object o) {\n    return o instanceof Point p && p.x == x && p.y == y;\n  }\n  @Override public int hashCode() {\n    return 31 * x + y;\n  }\n}',
    a: [
      'equals defines logical equality; hashCode must produce the same value for any two objects that are equal.',
      'Hash-based collections (HashMap, HashSet) find a bucket by hash first, then compare with equals. If equal objects hash differently, lookups miss.',
      'The reverse is not required: unequal objects may share a hash, which is just a collision.'
    ],
    why: 'This is the classic "my object is in the HashSet but contains() returns false" bug. Override both, and make the fields used immutable.',
    hint: 'HashMap does two steps: bucket by hash, then verify by equals.'
  },
  {
    id: 'jvm-hashmap', deck: 'jvm', topic: 'Collections', type: 'concept',
    q: 'How does a HashMap work internally, and what is the average complexity?',
    a: [
      'It keeps an array of buckets. A key\'s hash picks a bucket; entries in the same bucket form a list.',
      'Java 8+ converts a long collision chain into a red-black tree, so worst case degrades to O(log n) instead of O(n).',
      'Average get/put is O(1). Resizing happens when the load factor (default 0.75) is exceeded, and it rehashes everything.'
    ],
    why: 'This is the single most asked collections question. Mention collisions, load factor, resize cost, and that keys must be immutable.',
    hint: 'Array of buckets plus collision handling plus resizing.'
  },
  {
    id: 'jvm-arraylist-linkedlist', deck: 'jvm', topic: 'Collections', type: 'mcq',
    q: 'Which statement about ArrayList vs LinkedList is correct?',
    choices: [
      'ArrayList gives O(1) random access; LinkedList gives O(1) insert/remove at a known node',
      'LinkedList gives O(1) random access; ArrayList gives O(1) inserts anywhere',
      'Both give O(1) random access and O(1) inserts anywhere',
      'ArrayList is always faster because it uses less memory'
    ],
    correct: 0,
    a: [
      'ArrayList is a backing array: index access is O(1), but inserting in the middle shifts elements — O(n).',
      'LinkedList is a doubly linked list: reaching index i is O(n), but once you hold the node, insert/remove is O(1).',
      'In practice ArrayList wins almost always because of cache locality and no per-node allocation.'
    ],
    why: 'The theoretical advantage of LinkedList rarely survives real memory access patterns. Choose ArrayList unless you have measured otherwise.',
    hint: 'One is contiguous memory, the other is scattered nodes with pointers.'
  },
  {
    id: 'jvm-type-erasure', deck: 'jvm', topic: 'Generics', type: 'concept',
    q: 'What is type erasure in Java, and how does C# differ?',
    a: [
      'Java generics are compile-time only. The compiler inserts casts and the runtime sees List, not List<String>, so you cannot do new T() or instanceof List<String>.',
      'C# generics are reified: the runtime knows the type arguments, so new T(), typeof(T) and List<string> checks work.',
      'Erasure keeps Java backward compatible but causes "unchecked cast" warnings and prevents primitive type arguments without boxing.'
    ],
    why: 'This is the crispest Java/C# contrast in interviews, and it explains why Java generics feel weaker at runtime.',
    hint: 'Ask whether the type argument exists at runtime.'
  },
  {
    id: 'jvm-boxing', deck: 'jvm', topic: 'Types', type: 'code', lang: 'java',
    q: 'What does this print?',
    code: 'Integer a = 127, b = 127;\nInteger c = 128, d = 128;\nSystem.out.println(a == b);\nSystem.out.println(c == d);',
    a: [
      'true, then false.',
      'Autoboxing caches Integer values from -128 to 127, so a and b are the same object.',
      '128 is outside the cache, so c and d are different objects and == compares references, not values.'
    ],
    why: 'Always compare boxed values with equals(). The cache makes == accidentally correct for small numbers, which is the worst kind of bug.',
    hint: '== on objects compares identity. Is there a cache involved?'
  },
  {
    id: 'jvm-string-pool', deck: 'jvm', topic: 'Strings', type: 'concept',
    q: 'Why are Java strings immutable, and what is the string pool?',
    a: [
      'Immutability makes strings safe to share, safe as HashMap keys, and thread-safe without locking.',
      'String literals are interned in a pool, so two identical literals point at the same object.',
      'new String("x") forces a new object outside the pool. For many concatenations use StringBuilder, not += in a loop.'
    ],
    why: 'String immutability is a design decision with security and performance consequences; the pool is why literal comparison sometimes works by accident.',
    hint: 'Sharing, hashing, and thread safety all depend on not changing.'
  },
  {
    id: 'jvm-gc', deck: 'jvm', topic: 'Memory & GC', type: 'concept',
    q: 'How does generational garbage collection work?',
    a: [
      'New objects are allocated in Eden. A minor GC copies survivors between survivor spaces and promotes long-lived objects to the old generation.',
      'Most objects die young, so scanning the small young generation frequently is cheap.',
      'Major/full GCs scan the old generation and are expensive; modern collectors (G1, ZGC, Shenandoah) reduce pause times by working incrementally or concurrently.'
    ],
    why: 'The generational hypothesis — most objects die young — is the idea to lead with. Then explain promotion and pause time.',
    hint: 'Why is it efficient to collect young objects often?'
  },
  {
    id: 'jvm-final-family', deck: 'jvm', topic: 'Language keywords', type: 'mcq',
    q: 'Which statement is correct about final, finally and finalize?',
    choices: [
      'final prevents reassignment/override, finally always runs a cleanup block, finalize is a deprecated GC hook',
      'final prevents inheritance only, finally catches exceptions, finalize frees memory deterministically',
      'All three are aliases for the same mechanism',
      'finally runs only when no exception is thrown'
    ],
    correct: 0,
    a: [
      'final on a variable stops reassignment, on a method stops overriding, on a class stops subclassing.',
      'finally belongs to try/catch and runs whether or not an exception escaped (usually for cleanup).',
      'finalize was a best-effort hook before collection; it is deprecated and should be replaced by try-with-resources or explicit close().'
    ],
    why: 'These names look alike and do completely different things — a favourite trick question.',
    hint: 'One is a modifier, one is a block, one is a method.'
  },
  {
    id: 'jvm-checked', deck: 'jvm', topic: 'Exceptions', type: 'concept',
    q: 'Checked vs unchecked exceptions in Java — what is the difference?',
    a: [
      'Checked exceptions (subclasses of Exception, not RuntimeException) must be caught or declared with throws; the compiler enforces it.',
      'Unchecked exceptions (RuntimeException and Error) represent programming or environment failures and need no declaration.',
      'C# has no checked exceptions at all, which is one reason APIs favour unchecked plus documentation.'
    ],
    why: 'Checked exceptions force callers to consider failure but pollute signatures. Most modern Java APIs lean on unchecked exceptions plus validation.',
    hint: 'Which one does the compiler force you to handle?'
  },
  {
    id: 'jvm-struct-class', deck: 'jvm', topic: 'C# types', type: 'concept',
    q: 'In C#, when should you use a struct instead of a class?',
    a: [
      'A struct is a value type: assignment copies it, and it usually lives on the stack or inline inside its container.',
      'Use a struct for small, immutable, value-like data (a point, a range, a money amount) where copying is cheap.',
      'Use a class for identity, inheritance, shared mutable state, and anything large; structs cannot inherit and box when treated as object.'
    ],
    why: 'The question is really about value semantics vs reference semantics, and the cost of copying.',
    hint: 'Small immutable value, or a thing with identity?'
  },
  {
    id: 'jvm-async-await', deck: 'jvm', topic: 'C# async', type: 'code', lang: 'csharp',
    q: 'What is the difference between these two methods?',
    code: '// A\npublic async Task<int> GetA() {\n  await Task.Delay(100);\n  return 1;\n}\n\n// B\npublic Task<int> GetB() {\n  return Task.Delay(100).ContinueWith(_ => 1);\n}',
    a: [
      'Both return a Task<int> and are non-blocking, but A is far easier to read and composes with try/catch and using.',
      'async/await does not create a thread. It lets the runtime park the continuation until the awaited operation completes.',
      'Prefer async all the way down; never block on it with .Result or .Wait(), which can deadlock.'
    ],
    why: 'async is about freeing threads during I/O, not about parallelism. That sentence answers half the follow-ups.',
    hint: 'Does await start a thread, or release one?'
  },
  {
    id: 'jvm-linq', deck: 'jvm', topic: 'LINQ', type: 'code', lang: 'csharp',
    q: 'Why does this query print nothing until it is enumerated?',
    code: 'var query = people.Where(p => p.Age > 30);\nConsole.WriteLine("built");\nforeach (var p in query) {\n  Console.WriteLine(p.Name);\n}',
    a: [
      'LINQ uses deferred execution: Where just builds an expression of work.',
      'The predicate runs only when foreach calls MoveNext, so "built" prints first.',
      'Calling ToList() forces immediate execution, which is important when the source can change or when you do not want repeated work.'
    ],
    why: 'Deferred execution is powerful for composition but causes double-query bugs and surprising timing.',
    hint: 'When does the predicate actually run?'
  },
  {
    id: 'jvm-streams', deck: 'jvm', topic: 'Streams', type: 'code', lang: 'java',
    q: 'What is the difference between map and flatMap on a Java Stream?',
    code: 'List<List<Integer>> nested = List.of(List.of(1,2), List.of(3));\nvar flat = nested.stream()\n  .flatMap(List::stream)\n  .toList();\n// [1, 2, 3]',
    a: [
      'map transforms each element one-to-one: Stream<List<Integer>> stays nested.',
      'flatMap transforms each element into a stream and concatenates them into one stream.',
      'Streams are lazy: intermediate operations do nothing until a terminal operation such as collect, forEach or toList runs.'
    ],
    why: 'flatMap is the standard tool for flattening nested collections and for chaining optional lookups.',
    hint: 'One flattens a level, the other does not.'
  },
  {
    id: 'jvm-overload-override', deck: 'jvm', topic: 'Polymorphism', type: 'concept',
    q: 'What is the difference between overloading and overriding?',
    a: [
      'Overloading: same method name, different parameter lists in the same class; chosen at compile time.',
      'Overriding: a subclass replaces a superclass method with the same signature; chosen at runtime by the actual object type.',
      'Overload resolution uses the static type, which is why a null argument can pick a surprising overload.'
    ],
    why: 'This is the clearest example of compile-time vs runtime polymorphism.',
    hint: 'Which one depends on the runtime type of the object?'
  },
  {
    id: 'jvm-pass-by-value', deck: 'jvm', topic: 'Semantics', type: 'concept',
    q: 'Is Java pass-by-value or pass-by-reference? What about C#?',
    a: [
      'Java is always pass-by-value. For objects, the value passed is the reference — so you can mutate the object but cannot rebind the caller\'s variable.',
      'C# is pass-by-value by default too, with ref, out and in to pass the variable itself.',
      'This is why a swap method cannot work in Java without a wrapper.'
    ],
    why: 'The phrase "pass-by-reference" causes endless confusion. Say: the reference is passed by value.',
    hint: 'Can the callee make the caller point at a new object?'
  },
  {
    id: 'jvm-record', deck: 'jvm', topic: 'Modern types', type: 'concept',
    q: 'What do Java records and C# records give you?',
    a: [
      'They are compact declarations for immutable data carriers: constructor, accessors, equals, hashCode and toString are generated.',
      'Java records are shallowly immutable classes and cannot extend another class.',
      'C# records add value equality and with-expressions for non-destructive updates; record struct gives a value type variant.'
    ],
    why: 'Value semantics plus immutability removes a lot of boilerplate and a whole class of aliasing bugs.',
    hint: 'Generated equality plus generated accessors, with no setters.'
  },
  {
    id: 'jvm-static', deck: 'jvm', topic: 'Language basics', type: 'concept',
    q: 'What does static mean, and when is it a design smell?',
    a: [
      'static belongs to the type, not to an instance: no this, shared across all instances, initialised once.',
      'Static mutable state is global state: it breaks test isolation and hides dependencies.',
      'Static methods are fine for pure helpers (Math.max) and factories; static mutable fields usually want to become injected dependencies.'
    ],
    why: 'The follow-up to "what is static" is usually "why is global state bad" — have the testing answer ready.',
    hint: 'Shared by every instance, and invisible in a constructor signature.'
  },
  {
    id: 'jvm-equals-vs-identity', deck: 'jvm', topic: 'Object contracts', type: 'mcq',
    q: 'What does == compare for two object references in Java and C#?',
    choices: [
      'Reference identity by default, unless the operator is overloaded',
      'Always structural equality of all fields',
      'Always the result of equals()/Equals()',
      'It does not compile for objects'
    ],
    correct: 0,
    a: [
      '== compares whether both references point at the same object.',
      'C# allows operator overloading, so == can mean value equality for types such as string or decimal.',
      'Use equals() in Java and Equals() in C# for logical equality.'
    ],
    why: 'Mixing identity and equality is a top source of production bugs when objects come from different sources.',
    hint: 'Same object, or same contents?'
  },
  {
    id: 'jvm-immutability', deck: 'jvm', topic: 'Design', type: 'concept',
    q: 'How do you make a class truly immutable?',
    a: [
      'Make fields private final and set them only in the constructor.',
      'Do not expose mutable internals: defensively copy collections in and out, or wrap with unmodifiable views.',
      'Ensure referenced objects are immutable too, and do not let subclasses override behaviour (make the class final).'
    ],
    why: 'Immutable objects are automatically thread-safe, safe map keys, and easy to cache. Most concurrency bugs disappear when state cannot change.',
    hint: 'No setters is only step one — what about the collection it returns?'
  },
  {
    id: 'jvm-volatile-sync', deck: 'jvm', topic: 'Concurrency', type: 'concept',
    q: 'What does volatile do, and how is it different from synchronized?',
    a: [
      'volatile guarantees visibility: writes are seen by other threads and reordering around it is restricted, but it does not make compound actions atomic.',
      'synchronized provides mutual exclusion plus visibility, so check-then-act sequences are safe.',
      'count++ on a volatile int is still a race; use AtomicInteger or a lock.'
    ],
    why: 'The distinction between visibility and atomicity is the heart of Java concurrency questions.',
    hint: 'Does it stop two threads from interleaving, or only make writes visible?'
  },
  {
    id: 'jvm-di', deck: 'jvm', topic: 'Design', type: 'concept',
    q: 'What is dependency injection, and why does it help testing?',
    a: [
      'DI means a class receives its collaborators instead of constructing them, usually through the constructor.',
      'It inverts control: the composition root decides which implementation to wire.',
      'Tests can pass a fake or mock implementation without touching a database, clock or network.'
    ],
    why: 'DI is not a framework — it is the principle of depending on abstractions and not creating your own dependencies. Frameworks just automate the wiring.',
    hint: 'Who decides which implementation the class uses?'
  }
]);
