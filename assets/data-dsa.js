window.CARDS = (window.CARDS || []).concat([
  {
    id: 'dsa-big-o', deck: 'dsa', topic: 'Complexity', type: 'concept',
    q: 'What does Big-O actually describe?',
    a: [
      'An upper bound on how runtime or memory grows as input size grows, ignoring constants and lower-order terms.',
      'O(2n + 5) is O(n): the shape matters, not the multiplier.',
      'It describes asymptotic behaviour, so an O(n log n) algorithm can lose to O(n^2) on small inputs.'
    ],
    why: 'Interviews test whether you can reason about growth, not whether you can memorise a table.',
    hint: 'Growth rate as n becomes large.'
  },
  {
    id: 'dsa-common-complexities', deck: 'dsa', topic: 'Complexity', type: 'mcq',
    q: 'Which is the correct ordering from fastest to slowest growth?',
    choices: [
      'O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)',
      'O(1) < O(n) < O(log n) < O(n log n) < O(n^2) < O(2^n)',
      'O(log n) < O(1) < O(n) < O(n^2) < O(n log n) < O(2^n)',
      'O(1) < O(log n) < O(n log n) < O(n) < O(2^n) < O(n^2)'
    ],
    correct: 0,
    a: [
      'Constant, logarithmic, linear, linearithmic, quadratic, exponential.',
      'Binary search is O(log n); a single pass is O(n); sorting is O(n log n); nested loops are usually O(n^2).',
      'Exponential and factorial algorithms are only viable for tiny inputs.'
    ],
    why: 'Being fast at this ordering lets you compare approaches out loud during an interview.',
    hint: 'Binary search sits between constant and linear.'
  },
  {
    id: 'dsa-array-access', deck: 'dsa', topic: 'Arrays', type: 'concept',
    q: 'Why is array index access O(1), and what is the cost of inserting in the middle?',
    a: [
      'Elements are contiguous and equal-sized, so the address is base + index * size — one calculation.',
      'Inserting or deleting in the middle requires shifting every later element: O(n).',
      'Appending is amortised O(1) for a dynamic array because capacity doubles occasionally.'
    ],
    why: 'Contiguous memory is also why arrays are cache-friendly and often beat theoretically faster structures.',
    hint: 'Address arithmetic vs shifting.'
  },
  {
    id: 'dsa-linked-list', deck: 'dsa', topic: 'Linked lists', type: 'concept',
    q: 'What is a linked list good at, and what does it give up?',
    a: [
      'O(1) insert and delete at a node you already hold, and no resizing or contiguity requirement.',
      'O(n) random access, extra memory per node for pointers, and poor cache locality.',
      'It is the basis for stacks, queues, LRU lists and adjacency lists.'
    ],
    why: 'The "you already hold the node" caveat is the part most candidates forget.',
    hint: 'Cheap surgery, expensive walking.'
  },
  {
    id: 'dsa-reverse-list', deck: 'dsa', topic: 'Linked lists', type: 'code',
    q: 'Reverse a singly linked list iteratively.',
    code: 'function reverse(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
    a: [
      'Keep three pointers: prev, curr and the saved next.',
      'Point curr.next backwards to prev, then advance both pointers.',
      'When curr becomes null, prev is the new head. Time O(n), space O(1).'
    ],
    why: 'This is the canonical pointer-manipulation warm-up. Draw the three pointers before coding.',
    hint: 'Save next before you overwrite the link.'
  },
  {
    id: 'dsa-hashmap', deck: 'dsa', topic: 'Hash maps', type: 'concept',
    q: 'What is the average and worst-case complexity of a hash map?',
    a: [
      'Average O(1) for insert, lookup and delete, assuming a good hash and low load factor.',
      'Worst case O(n) when every key collides into one bucket.',
      'A good implementation resizes and, like Java, may treeify long buckets to bring the worst case to O(log n).'
    ],
    why: 'Hash maps trade memory and ordering for speed. Mention collisions and resizing to show depth.',
    hint: 'Average is constant; worst case depends on collisions.'
  },
  {
    id: 'dsa-stack-queue', deck: 'dsa', topic: 'Stacks & queues', type: 'concept',
    q: 'What are stacks and queues used for?',
    a: [
      'Stack: LIFO — function calls, undo, DFS, parsing, bracket matching.',
      'Queue: FIFO — BFS, task scheduling, buffers, rate limiting.',
      'A deque supports both ends and backs sliding-window maximum and work-stealing schedulers.'
    ],
    why: 'Recognising "this needs DFS/BFS" often starts with "stack or queue".',
    hint: 'LIFO for depth, FIFO for breadth.'
  },
  {
    id: 'dsa-bst', deck: 'dsa', topic: 'Trees', type: 'concept',
    q: 'What is the invariant of a binary search tree, and when does it degrade?',
    a: [
      'For every node, all values in the left subtree are smaller and all in the right subtree are larger.',
      'Search, insert and delete are O(h), where h is height.',
      'Inserting sorted data creates a linked list of height n, so balanced trees (AVL, red-black) guarantee O(log n).'
    ],
    why: 'The sorted-insert degeneration is the follow-up interviewers expect.',
    hint: 'Height, not node count, drives the cost.'
  },
  {
    id: 'dsa-traversals', deck: 'dsa', topic: 'Trees', type: 'code',
    q: 'Name the four binary tree traversals and what each is for.',
    code: 'inorder(node) {\n  if (!node) return;\n  inorder(node.left);\n  visit(node);\n  inorder(node.right);\n}\n// BST inorder = sorted order',
    a: [
      'Preorder: node, left, right — copy or serialise a tree.',
      'Inorder: left, node, right — sorted order for a BST.',
      'Postorder: left, right, node — delete or evaluate bottom-up.',
      'Level order: BFS with a queue — by depth.'
    ],
    why: 'Inorder on a BST giving sorted output is the most commonly asked property.',
    hint: 'Where does the visit happen relative to the children?'
  },
  {
    id: 'dsa-heap', deck: 'dsa', topic: 'Heaps', type: 'concept',
    q: 'What is a heap, and what is it used for?',
    a: [
      'A complete binary tree stored in an array where each parent is <= its children (min-heap) or >= (max-heap).',
      'Peek is O(1), push and pop are O(log n), and building from an array is O(n).',
      'Used for priority queues, Dijkstra, scheduling, and top-k problems.'
    ],
    why: 'Top-k with a heap of size k is O(n log k) — a favourite optimisation question.',
    hint: 'Partial order, not full sorting.'
  },
  {
    id: 'dsa-topk', deck: 'dsa', topic: 'Heaps', type: 'concept',
    q: 'How do you find the k largest elements in an array of n numbers?',
    a: [
      'Keep a min-heap of size k. Push each element; if the heap exceeds k, pop the smallest.',
      'The heap always holds the k largest seen so far, and its root is the smallest of them.',
      'Time O(n log k), space O(k) — better than sorting everything when k is small.'
    ],
    why: 'The counter-intuitive part is using a min-heap to track largest values.',
    hint: 'Which element should be easiest to evict?'
  },
  {
    id: 'dsa-graph-rep', deck: 'dsa', topic: 'Graphs', type: 'concept',
    q: 'Adjacency list vs adjacency matrix — when do you use each?',
    a: [
      'Adjacency list: O(V + E) space, fast iteration over neighbours; best for sparse graphs.',
      'Adjacency matrix: O(V^2) space, O(1) edge lookup; best for dense graphs or when you need matrix operations.',
      'Most real graphs are sparse, so adjacency lists are the default.'
    ],
    why: 'The space difference is the answer, plus the edge-lookup trade-off.',
    hint: 'Sparse or dense?'
  },
  {
    id: 'dsa-bfs-dfs', deck: 'dsa', topic: 'Graphs', type: 'concept',
    q: 'BFS vs DFS — when do you use each?',
    a: [
      'BFS uses a queue and explores level by level: shortest path in an unweighted graph, nearest neighbour, level analysis.',
      'DFS uses a stack or recursion and goes deep: cycle detection, topological sort, connected components, backtracking.',
      'Both are O(V + E) with an adjacency list; DFS risks stack overflow on deep graphs.'
    ],
    why: 'Saying "BFS for shortest unweighted path" immediately signals you know the invariant.',
    hint: 'Shortest unweighted path vs exhaustive exploration.'
  },
  {
    id: 'dsa-binary-search', deck: 'dsa', topic: 'Searching', type: 'code',
    q: 'Write a binary search and name the classic bug.',
    code: 'function binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}',
    a: [
      'The array must be sorted; each step halves the search space, giving O(log n).',
      'The classic bug is (lo + hi) / 2 overflowing a fixed-size int; use lo + (hi - lo) / 2.',
      'Off-by-one errors come from mixing inclusive and exclusive bounds — pick one convention and stay in it.'
    ],
    why: 'Binary search is easy to write and hard to write correctly. Interviewers watch the bounds.',
    hint: 'Shrink the interval, and be careful with the midpoint.'
  },
  {
    id: 'dsa-two-pointers', deck: 'dsa', topic: 'Patterns', type: 'code',
    q: 'How does the two-pointer technique check if a string is a palindrome?',
    code: 'function isPalindrome(s) {\n  let l = 0, r = s.length - 1;\n  while (l < r) {\n    if (s[l] !== s[r]) return false;\n    l++; r--;\n  }\n  return true;\n}',
    a: [
      'Start one pointer at each end and move them inward, comparing as you go.',
      'Time O(n), space O(1) — much better than reversing the string.',
      'The same idea solves sorted two-sum, removing duplicates, and container-with-most-water.'
    ],
    why: 'Two pointers is the first pattern to try on sorted arrays and palindromes.',
    hint: 'One from the left, one from the right.'
  },
  {
    id: 'dsa-sliding-window', deck: 'dsa', topic: 'Patterns', type: 'code',
    q: 'Find the length of the longest substring without repeating characters.',
    code: 'function longestUnique(s) {\n  const last = new Map();\n  let start = 0, best = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (last.has(s[i]) && last.get(s[i]) >= start) {\n      start = last.get(s[i]) + 1;\n    }\n    last.set(s[i], i);\n    best = Math.max(best, i - start + 1);\n  }\n  return best;\n}',
    a: [
      'Maintain a window [start, i] that contains no duplicates.',
      'When a duplicate appears inside the window, move start just past its previous index.',
      'Each character is visited once, so time is O(n) and space is O(alphabet).'
    ],
    why: 'Sliding window converts an O(n^2) brute force into O(n) by never moving the left edge backwards.',
    hint: 'When the window breaks, where should its left edge jump to?'
  },
  {
    id: 'dsa-prefix-sum', deck: 'dsa', topic: 'Patterns', type: 'concept',
    q: 'What is a prefix sum, and what does it let you do?',
    a: [
      'Precompute cumulative sums so sum(l..r) = prefix[r+1] - prefix[l] in O(1).',
      'It turns repeated range-sum queries from O(n) each into O(n) preprocessing plus O(1) per query.',
      'A hash map of prefix sums also solves "count subarrays with sum k" in one pass.'
    ],
    why: 'Trading a little memory for constant-time range queries is a standard optimisation.',
    hint: 'Cumulative totals let you subtract instead of re-adding.'
  },
  {
    id: 'dsa-dp', deck: 'dsa', topic: 'Dynamic programming', type: 'concept',
    q: 'How do you recognise a dynamic programming problem?',
    a: [
      'Optimal substructure: the best answer is built from best answers to subproblems.',
      'Overlapping subproblems: the same subproblem is solved many times, so caching pays off.',
      'Define the state, the recurrence, and the base case. Then choose top-down memoisation or bottom-up tabulation.'
    ],
    why: 'Most DP failures are state-definition failures, not coding failures. Say the state out loud first.',
    hint: 'Can you define the answer to a smaller instance in terms of smaller ones?'
  },
  {
    id: 'dsa-fib', deck: 'dsa', topic: 'Dynamic programming', type: 'code',
    q: 'Why is naive recursive Fibonacci exponential, and how do you fix it?',
    code: 'function fib(n, memo = new Map()) {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const val = fib(n - 1, memo) + fib(n - 2, memo);\n  memo.set(n, val);\n  return val;\n}',
    a: [
      'Naive recursion recomputes the same values exponentially often: O(2^n).',
      'Memoisation caches each result once, giving O(n) time and O(n) space.',
      'Bottom-up with two variables gets O(n) time and O(1) space because only the last two values matter.'
    ],
    why: 'This is the smallest complete DP example: recurrence, overlap, memo, then space optimisation.',
    hint: 'How many times is fib(3) computed in fib(10)?'
  },
  {
    id: 'dsa-greedy', deck: 'dsa', topic: 'Greedy', type: 'concept',
    q: 'When is a greedy algorithm correct?',
    a: [
      'When a locally optimal choice can be proven to lead to a globally optimal solution (the greedy-choice property).',
      'When the problem has optimal substructure and no need to revisit earlier choices.',
      'Classic examples: interval scheduling by earliest finish, Huffman coding, Dijkstra with non-negative weights.'
    ],
    why: 'Greedy is fast but easy to get wrong. The proof, or a counterexample, is the interview point.',
    hint: 'Can a locally best choice ever need to be undone?'
  },
  {
    id: 'dsa-sorting', deck: 'dsa', topic: 'Sorting', type: 'concept',
    q: 'Compare quicksort, mergesort and insertion sort.',
    a: [
      'Quicksort: average O(n log n), in-place, but O(n^2) worst case on bad pivots; not stable.',
      'Mergesort: guaranteed O(n log n) and stable, but O(n) extra space.',
      'Insertion sort: O(n^2) but very fast on small or nearly sorted arrays, which is why real sorts switch to it for tiny partitions.'
    ],
    why: 'The stable/in-place/guarantee triangle is the answer. There is no single best sort.',
    hint: 'Stability, extra space, worst-case guarantee.'
  },
  {
    id: 'dsa-quicksort', deck: 'dsa', topic: 'Sorting', type: 'code',
    q: 'What does the partition step in quicksort do?',
    code: 'function partition(arr, lo, hi) {\n  const pivot = arr[hi];\n  let i = lo;\n  for (let j = lo; j < hi; j++) {\n    if (arr[j] < pivot) {\n      [arr[i], arr[j]] = [arr[j], arr[i]];\n      i++;\n    }\n  }\n  [arr[i], arr[hi]] = [arr[hi], arr[i]];\n  return i;\n}',
    a: [
      'Choose a pivot and rearrange so everything smaller is to its left and everything larger to its right.',
      'Return the pivot index, then recurse on both sides.',
      'With a random or median pivot, expected depth is O(log n); with sorted input and a last-element pivot it degenerates to O(n^2).'
    ],
    why: 'Partition is the whole algorithm; the recursion is trivial once partition is correct.',
    hint: 'Invariant: everything before i is smaller than the pivot.'
  },
  {
    id: 'dsa-trie', deck: 'dsa', topic: 'Tries', type: 'concept',
    q: 'What is a trie good for?',
    a: [
      'A prefix tree where each edge is a character; lookup and insert are O(L) for a word of length L, independent of dictionary size.',
      'It supports prefix queries, autocomplete, spell check and IP routing tables.',
      'The cost is memory: many nodes with child maps, which can be large for big alphabets.'
    ],
    why: 'The prefix property is the reason to choose a trie over a hash set.',
    hint: 'Shared prefixes become shared paths.'
  },
  {
    id: 'dsa-union-find', deck: 'dsa', topic: 'Union-find', type: 'concept',
    q: 'How does union-find work, and what makes it near-constant time?',
    a: [
      'Each element points to a parent; find follows pointers to the representative root, union links two roots.',
      'Union by rank/size keeps trees shallow; path compression flattens them during find.',
      'Together they give amortised O(alpha(n)), effectively constant, and are the standard tool for connected components and Kruskal.'
    ],
    why: 'The two optimisations are the answer; either alone is worse.',
    hint: 'Two independent tricks, one during union and one during find.'
  },
  {
    id: 'dsa-lru', deck: 'dsa', topic: 'Design', type: 'concept',
    q: 'How do you implement an LRU cache with O(1) get and put?',
    a: [
      'Combine a hash map (key to node) with a doubly linked list ordered by recency.',
      'get moves the node to the front; put inserts at the front and evicts the tail when over capacity.',
      'The map gives O(1) lookup and the list gives O(1) move and eviction because you hold the node directly.'
    ],
    why: 'LRU is the classic "combine two structures" design question. Name both and the reason for each.',
    hint: 'One structure finds the item, the other remembers the order.'
  },
  {
    id: 'dsa-recursion', deck: 'dsa', topic: 'Recursion', type: 'concept',
    q: 'What are the two parts every recursive function needs?',
    a: [
      'A base case that returns without recursing, otherwise you get infinite recursion and a stack overflow.',
      'A recursive case that moves strictly closer to the base case.',
      'Recursion depth is bounded by the call stack; convert to an explicit stack or iteration if depth can be large.'
    ],
    why: 'Most recursion bugs are a missing base case or an argument that does not shrink.',
    hint: 'When do you stop, and how do you get closer each time?'
  },
  {
    id: 'dsa-backtracking', deck: 'dsa', topic: 'Backtracking', type: 'concept',
    q: 'What is the shape of a backtracking algorithm?',
    a: [
      'Choose a candidate, recurse, then undo the choice (backtrack).',
      'You explore a decision tree, pruning branches that cannot lead to a valid solution.',
      'Examples: permutations, subsets, N-queens, Sudoku, combination sum.'
    ],
    why: 'The undo step is the defining feature; forgetting it corrupts later branches.',
    hint: 'Choose, explore, un-choose.'
  },
  {
    id: 'dsa-space-complexity', deck: 'dsa', topic: 'Complexity', type: 'concept',
    q: 'How do you compute the space complexity of a recursive algorithm?',
    a: [
      'Count the extra memory beyond the input, including the call stack frames.',
      'Each active frame costs O(1) here, so recursion depth d gives O(d) space.',
      'An in-place iterative version of the same algorithm may drop to O(1).'
    ],
    why: 'Candidates often forget the stack. Quicksort is O(log n) space on average because of recursion.',
    hint: 'Every suspended call still occupies a frame.'
  },
  {
    id: 'dsa-interview-approach', deck: 'dsa', topic: 'Interview strategy', type: 'concept',
    q: 'What is a reliable structure for solving an interview problem out loud?',
    a: [
      'Restate the problem and confirm constraints: input size, sortedness, duplicates, value ranges.',
      'Describe a brute force with its complexity, then optimise using a known pattern.',
      'Code the optimised version, then test with a normal case, an edge case, and a failing case.'
    ],
    why: 'Interviewers score communication and structure as much as the final code. Constraints usually reveal the intended complexity.',
    hint: 'Constraints first, then brute force, then pattern.'
  }
]);
