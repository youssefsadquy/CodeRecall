window.CARDS = (window.CARDS || []).concat([
  {
    id: 'py-mutable-default', deck: 'py', topic: 'Functions', type: 'code', lang: 'py',
    q: 'Why is this dangerous?',
    code: 'def add_item(item, bucket=[]):\n    bucket.append(item)\n    return bucket\n\nprint(add_item("a"))  # ["a"]\nprint(add_item("b"))  # ["a", "b"]',
    a: [
      'Default arguments are evaluated once, when the function is defined — not on every call.',
      'The same list object is reused, so state leaks between calls.',
      'Use None as the sentinel: def add_item(item, bucket=None): bucket = [] if bucket is None else bucket.'
    ],
    why: 'This is the classic Python interview trap and a real source of cross-request data leaks in web apps.',
    hint: 'When is the default expression evaluated?'
  },
  {
    id: 'py-is-eq', deck: 'py', topic: 'Objects & identity', type: 'concept', lang: 'py',
    q: 'What is the difference between is and ==?',
    a: [
      '== compares values via __eq__; is compares object identity (same memory object).',
      'Use is only for singletons such as None, True and False.',
      'Small integers and some strings are interned, so `a is b` can accidentally be true — never rely on it for values.'
    ],
    code: 'a = [1, 2]\nb = [1, 2]\na == b   # True\na is b   # False\n\na = None\nif a is None: ...',
    why: 'Using is for numbers or strings produces bugs that appear to work in development and fail later.',
    hint: 'Identity versus equality.'
  },
  {
    id: 'py-list-tuple', deck: 'py', topic: 'Data structures', type: 'concept',
    q: 'List or tuple — when do you choose each?',
    a: [
      'Lists are mutable, variable-length sequences; tuples are immutable and can be hashable (if their contents are).',
      'Tuples signal a fixed record (coordinates, DB row) and can be dictionary keys or set members.',
      'Tuples are slightly smaller/faster, but choose for semantics first: fixed shape versus a collection that changes.'
    ],
    why: 'Immutability is a design signal and enables hashing. Interviewers listen for "hashable", not just "faster".',
    hint: 'Which one can be a dict key?'
  },
  {
    id: 'py-comprehension', deck: 'py', topic: 'Idioms', type: 'code', lang: 'py',
    q: 'What do these two lines produce?',
    code: 'squares = [x * x for x in range(5) if x % 2 == 0]\npairs = {k: v for k, v in zip("ab", [1, 2])}',
    a: [
      'squares is [0, 4, 16] — only even x values are squared.',
      'pairs is {"a": 1, "b": 2}.',
      'Comprehension variables are scoped to the comprehension in Python 3; they do not leak into the enclosing scope.'
    ],
    why: 'Comprehensions are idiomatic and faster than manual append loops, but deep nesting hurts readability.',
    hint: 'Apply the filter first, then the expression.'
  },
  {
    id: 'py-generators', deck: 'py', topic: 'Iterators', type: 'concept', lang: 'py',
    q: 'What does yield do, and why use a generator?',
    a: [
      'yield produces a value and pauses the function, resuming where it left off on the next request.',
      'Generators are lazy: they hold one item at a time instead of materialising the whole sequence.',
      'They are one-shot — once exhausted, iterating again yields nothing unless you recreate the generator.'
    ],
    code: 'def read_lines(path):\n    with open(path) as f:\n        for line in f:\n            yield line.strip()\n\nfor line in read_lines("big.log"):\n    ...',
    why: 'Generators turn "load 5 GB into RAM" into streaming with constant memory — essential for logs, pagination and pipelines.',
    hint: 'Pause and resume, one item at a time.'
  },
  {
    id: 'py-decorator', deck: 'py', topic: 'Functions', type: 'code', lang: 'py',
    q: 'What does this decorator add?',
    code: 'import functools, time\n\ndef timed(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        out = fn(*args, **kwargs)\n        print(fn.__name__, time.perf_counter() - start)\n        return out\n    return wrapper\n\n@timed\ndef work(): ...',
    a: [
      'A decorator is a function that takes a function and returns a replacement — here, one that logs elapsed time.',
      '@timed is syntax sugar for work = timed(work).',
      'functools.wraps preserves the original name, docstring and signature metadata.'
    ],
    why: 'Decorators are how frameworks add auth, caching and logging without touching business logic. Flask and pytest routes rely on them.',
    hint: 'What does @timed literally rewrite the definition into?'
  },
  {
    id: 'py-args-kwargs', deck: 'py', topic: 'Functions', type: 'concept',
    q: 'What do *args and **kwargs do?',
    a: [
      '*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict.',
      'You can also use them to forward arguments: fn(*args, **kwargs).',
      'Keyword-only arguments can be forced with a bare * in the signature: def f(a, *, b).'
    ],
    why: 'Argument forwarding is essential for wrappers, decorators and subclass APIs. It also shows up constantly in interview code.',
    hint: 'One packs positionals, the other packs keywords.'
  },
  {
    id: 'py-context-manager', deck: 'py', topic: 'Resource management', type: 'concept', lang: 'py',
    q: 'What makes the with statement better than manual close()?',
    a: [
      'with calls __enter__ on entry and guarantees __exit__ on exit, including when an exception is raised.',
      'It removes leaked file handles, sockets and locks — resources are released on every path.',
      'You can write your own with contextlib.contextmanager and yield, or define the two dunder methods.'
    ],
    code: 'with open("data.txt", encoding="utf-8") as f:\n    text = f.read()\n# file is closed here even if read() raised',
    why: 'Deterministic cleanup is a Python strength. Garbage collection alone is not a resource-management strategy.',
    hint: 'What happens to the resource on the exception path?'
  },
  {
    id: 'py-gil', deck: 'py', topic: 'Concurrency', type: 'concept',
    q: 'What is the GIL, and what does it mean for threads versus processes?',
    a: [
      'The Global Interpreter Lock lets only one thread execute Python bytecode at a time in CPython.',
      'Threads still help with I/O-bound work because the lock is released during blocking I/O.',
      'For CPU-bound work, use multiprocessing (separate interpreters) or native extensions; newer free-threaded Python builds are beginning to change this.'
    ],
    why: 'Choosing threads for CPU work in Python is a common performance mistake. The GIL is about the implementation, not the language.',
    hint: 'I/O waits release the lock; pure computation does not.'
  },
  {
    id: 'py-hashable', deck: 'py', topic: 'Data structures', type: 'concept',
    q: 'Why can a list not be a dictionary key, but a tuple can?',
    a: [
      'Dict keys must be hashable: they need a stable hash and value equality for their lifetime.',
      'Lists are mutable, so their hash could change — Python therefore marks them unhashable.',
      'Tuples are hashable only if every element inside them is hashable.'
    ],
    why: 'This is the practical face of the hash/equality contract. The same rule explains sets and why dataclasses need frozen=True to be hashable.',
    hint: 'What happens if a key mutates after insertion?'
  },
  {
    id: 'py-copy', deck: 'py', topic: 'Objects & identity', type: 'code', lang: 'py',
    q: 'What is printed?',
    code: 'import copy\na = [[1, 2], [3, 4]]\nb = a[:]\nc = copy.deepcopy(a)\nb[0][0] = 99\nprint(a[0][0], c[0][0])',
    a: [
      'It prints 99 1.',
      'a[:] is a shallow copy: the outer list is new, but the inner lists are shared.',
      'copy.deepcopy recursively copies nested objects so mutations stay independent.'
    ],
    why: 'Shallow copies are the default in slicing, list(), dict() and copy.copy(). Nested mutable state needs an explicit deep copy.',
    hint: 'How deep does the copy go?'
  },
  {
    id: 'py-exceptions', deck: 'py', topic: 'Errors', type: 'concept', lang: 'py',
    q: 'When do else and finally run in a try statement?',
    a: [
      'else runs if the try block completed without an exception.',
      'finally always runs — on success, on exception, and even on return.',
      'Use else to keep the try block minimal; use finally for cleanup (though with is usually cleaner).'
    ],
    code: 'try:\n    value = int(text)\nexcept ValueError:\n    value = 0\nelse:\n    print("parsed", value)\nfinally:\n    print("done")',
    why: 'Narrow try blocks prevent accidentally swallowing unrelated errors. Bare except: is almost always wrong.',
    hint: 'Success path versus always path.'
  },
  {
    id: 'py-dataclass', deck: 'py', topic: 'Classes', type: 'concept', lang: 'py',
    q: 'What does @dataclass generate, and when should it be frozen?',
    a: [
      '@dataclass generates __init__, __repr__ and __eq__ from annotated fields.',
      'frozen=True makes instances immutable and hashable, so they can be dict keys or set members.',
      'Use field(default_factory=list) for mutable defaults — the same trap as default arguments.'
    ],
    code: 'from dataclasses import dataclass, field\n\n@dataclass(frozen=True)\nclass Point:\n    x: int\n    y: int\n    tags: list = field(default_factory=list)',
    why: 'Dataclasses remove boilerplate for value objects, and frozen=True gives you safe, hashable records.',
    hint: 'Which methods would you otherwise write by hand?'
  },
  {
    id: 'py-type-hints', deck: 'py', topic: 'Typing', type: 'concept',
    q: 'Do Python type hints enforce types at runtime?',
    a: [
      'No. Hints are metadata for humans and tools; the interpreter does not check them when calling a function.',
      'Tools like mypy, pyright and IDEs use them for static analysis; pydantic can validate at runtime.',
      'Use them on public functions and data boundaries; they pay off most in large codebases and refactors.'
    ],
    why: 'Expecting runtime enforcement from hints leads to false confidence. Validation still belongs at the boundary.',
    hint: 'Static analysis versus runtime execution.'
  },
  {
    id: 'py-slicing', deck: 'py', topic: 'Idioms', type: 'code', lang: 'py',
    q: 'What are the results?',
    code: 's = "abcdef"\nprint(s[1:4])\nprint(s[::-1])\nprint(s[-2:])\nprint(s[::2])',
    a: [
      'bcd, fedcba, ef, ace.',
      'slice(start, stop, step) excludes stop and supports negative indices.',
      's[::-1] reverses because a step of -1 walks backwards; s[:] returns a copy.'
    ],
    why: 'Slicing is concise but easy to misread. Being fluent here matters for parsing and interview whiteboard code.',
    hint: 'Start inclusive, stop exclusive, step optional.'
  },
  {
    id: 'py-zip-enumerate', deck: 'py', topic: 'Idioms', type: 'concept', lang: 'py',
    q: 'What do zip and enumerate give you?',
    a: [
      'zip(a, b) yields tuples pairing elements by position, stopping at the shortest input (use strict=True in 3.10+ to error instead).',
      'enumerate(items) yields (index, item) pairs, optionally starting at a custom number.',
      'Both are lazy iterators, so wrap in list() only when you need to materialise them.'
    ],
    code: 'for i, name in enumerate(names, start=1):\n    print(i, name)\n\nfor left, right in zip(xs, ys):\n    ...',
    why: 'These remove manual index bookkeeping, which is where off-by-one bugs live.',
    hint: 'Positional pairs, with or without an index.'
  },
  {
    id: 'py-sorted-key', deck: 'py', topic: 'Idioms', type: 'code', lang: 'py',
    q: 'How is this list ordered?',
    code: 'people = [{"name": "Ada", "age": 36},\n          {"name": "Linus", "age": 55},\n          {"name": "Grace", "age": 45}]\nordered = sorted(people, key=lambda p: -p["age"])',
    a: [
      'by_age_descending, with Linus first, then Grace, then Ada.',
      'sorted() returns a new list; list.sort() mutates in place.',
      'Python sorts are stable, so equal keys keep their original relative order.'
    ],
    why: 'The key function is the clean way to sort complex data, and stability matters for multi-pass sorting.',
    hint: 'The minus sign flips the order.'
  },
  {
    id: 'py-class-attrs', deck: 'py', topic: 'Classes', type: 'code', lang: 'py',
    q: 'Why do both instances share the list?',
    code: 'class Team:\n    members = []\n\n    def add(self, name):\n        self.members.append(name)\n\na, b = Team(), Team()\na.add("Ada")\nprint(b.members)',
    a: [
      'It prints ["Ada"]. members is a class attribute: one list shared by every instance.',
      'Assigning self.members = [] inside __init__ creates a per-instance attribute that shadows the class one.',
      'Rule: class attributes for constants/behaviour, instance attributes for state.'
    ],
    why: 'Shared mutable class state leaks between users, tests and requests. This is a quiet production bug, not just trivia.',
    hint: 'Where does attribute lookup find members?'
  },
  {
    id: 'py-property', deck: 'py', topic: 'Classes', type: 'concept', lang: 'py',
    q: 'What does @property let you do?',
    a: [
      'Expose a method as an attribute while keeping call syntax simple (user.full_name, not user.full_name()).',
      'Add validation or computation without breaking the public interface when the implementation changes.',
      'Define a setter with @name.setter; keep properties cheap and free of surprising side effects.'
    ],
    code: 'class User:\n    def __init__(self, first, last):\n        self.first, self.last = first, last\n\n    @property\n    def full_name(self):\n        return f"{self.first} {self.last}"',
    why: 'Properties preserve API compatibility when a plain field later needs logic. They are also how ORMs expose columns.',
    hint: 'It computes on access, without parentheses.'
  },
  {
    id: 'py-late-binding', deck: 'py', topic: 'Functions', type: 'code', lang: 'py',
    q: 'Why do all three functions return 2?',
    code: 'funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])',
    a: [
      'It prints [2, 2, 2]. Each lambda closes over the variable i, not its current value.',
      'By the time the lambdas run, the comprehension has finished and i is 2.',
      'Bind the value with a default argument: [lambda i=i: i for i in range(3)].'
    ],
    why: 'Late binding explains many callback bugs in loops — especially event handlers and deferred jobs.',
    hint: 'When is the value of i read — at definition or at call?'
  },
  {
    id: 'py-file-encoding', deck: 'py', topic: 'Files', type: 'concept',
    q: 'Why pass encoding="utf-8" explicitly to open()?',
    a: [
      'Without it, Python uses the platform default, which differs across Windows and Linux and can corrupt or fail on non-ASCII text.',
      'Explicit encoding makes behaviour reproducible across machines.',
      'Use newline="" for CSV files when you need exact control over line endings.'
    ],
    why: 'Encoding bugs appear as mojibake or UnicodeDecodeError only on certain machines — deterministic code avoids them.',
    hint: 'What is the default on Windows?'
  },
  {
    id: 'py-asyncio', deck: 'py', topic: 'Concurrency', type: 'concept', lang: 'py',
    q: 'How does asyncio achieve concurrency without threads?',
    a: [
      'An event loop runs coroutines and switches at await points, so one thread can handle many waiting I/O operations.',
      'It is cooperative: a coroutine that blocks without awaiting stalls the whole loop.',
      'Use asyncio.gather for independent awaits; use threads or processes for blocking libraries and CPU work.'
    ],
    code: 'async def load_all(urls):\n    async with aiohttp.ClientSession() as s:\n        return await asyncio.gather(*[fetch(s, u) for u in urls])',
    why: 'Async is about overlapping waits, not parallel CPU. Calling time.sleep inside async code blocks everything.',
    hint: 'Where does the loop get a chance to switch tasks?'
  },
  {
    id: 'py-hash-eq', deck: 'py', topic: 'Objects & identity', type: 'concept',
    q: 'What contract must __eq__ and __hash__ satisfy?',
    a: [
      'If a == b, then hash(a) must equal hash(b).',
      'Objects used as dict keys or set members need both a stable hash and consistent equality.',
      'Defining __eq__ without __hash__ makes the class unhashable by default; frozen dataclasses handle both.'
    ],
    why: 'Violating the contract makes lookups fail in ways that look random — the key is in the dict but cannot be found.',
    hint: 'Equal values must land in the same hash bucket.'
  },
  {
    id: 'py-truthiness', deck: 'py', topic: 'Idioms', type: 'concept',
    q: 'Which values are falsy in Python?',
    a: [
      'False, None, numeric zero (0, 0.0), empty strings, and empty containers ([] () {} set()).',
      'Everything else is truthy, including the string "0" and a non-empty list of zeros.',
      'Use `if items:` for emptiness, but use `if x is not None:` when 0 and None mean different things.'
    ],
    why: 'Treating 0 as "missing" is a classic bug in configuration and metrics code. Be explicit when zero is valid.',
    hint: 'Empty containers, zero, None, False.'
  },
  {
    id: 'py-fstring', deck: 'py', topic: 'Idioms', type: 'concept',
    q: 'What do f-strings add over concatenation?',
    a: [
      'Expressions are evaluated inside the string: f"{user.name} has {count} items".',
      'Format specs are built in: f"{price:.2f}", f"{ratio:.1%}", f"{value:>10}".',
      'The = specifier helps debugging: f"{count=}" prints count=3.'
    ],
    why: 'Readable formatting is not cosmetic; it reduces logging and report bugs. F-strings are the modern default.',
    hint: 'Compile-time concatenation versus inline expressions.'
  }
]);
