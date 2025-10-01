// 100 Most Common Python Interview Questions
// Categorized by difficulty: Easy (1-35), Medium (36-70), Hard (71-100)

const pythonQuestions = [
  // EASY QUESTIONS (1-35)
  {
    question: "What is Python? What are the benefits of using Python?",
    context: "Introduction to Python and its advantages",
    answer: "Python is a high-level, interpreted programming language known for its simplicity and readability. Benefits include: easy to learn and use, extensive standard library, cross-platform compatibility, large community support, and versatility for various applications.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between Python 2 and Python 3?",
    context: "Python version differences",
    answer: "Python 3 has better Unicode support, print is a function (not statement), integer division returns float by default, improved exception handling syntax, and many standard library improvements. Python 2 reached end-of-life in 2020.",
    difficulty: "easy"
  },
  {
    question: "What are Python keywords?",
    context: "Reserved words in Python",
    answer: "Keywords are reserved words that have special meanings in Python. Examples include: and, or, not, if, else, elif, for, while, def, class, import, from, try, except, finally, with, as, lambda, True, False, None.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between a list and a tuple in Python?",
    context: "Data structures comparison",
    answer: "Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses (). Tuples are more memory-efficient and can be used as dictionary keys.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between == and is operators?",
    context: "Equality vs identity comparison",
    answer: "== compares values for equality, while 'is' compares object identity (whether two variables point to the same object in memory).\n\nExample:\n```python\na = [1, 2, 3]\nb = [1, 2, 3]\nc = a\n\nprint(a == b)  # True (same values)\nprint(a is b)  # False (different objects)\nprint(a is c)  # True (same object)\nprint(id(a), id(b), id(c))  # Different ids for a,b but same for a,c\n```",
    difficulty: "easy"
  },
  {
    question: "What are Python data types?",
    context: "Built-in data types",
    answer: "Python has several built-in data types: Numbers (int, float, complex), Strings (str), Boolean (bool), Sequences (list, tuple, range), Mappings (dict), Sets (set, frozenset), and None type.",
    difficulty: "easy"
  },
  {
    question: "What is indentation in Python?",
    context: "Python syntax rules",
    answer: "Indentation in Python is used to define code blocks instead of curly braces. It must be consistent (typically 4 spaces) and is syntactically significant. Incorrect indentation raises an IndentationError.",
    difficulty: "easy"
  },
  {
    question: "What are comments in Python?",
    context: "Code documentation",
    answer: "Comments are explanatory text ignored by the interpreter. Single-line comments start with #. Multi-line comments can use triple quotes ''' or \"\"\". Docstrings are special comments used for documentation.",
    difficulty: "easy"
  },
  {
    question: "What is a variable in Python?",
    context: "Variable concepts",
    answer: "A variable is a name that refers to a value stored in memory. Python variables don't need explicit declaration, are dynamically typed, and follow naming rules (must start with letter or underscore, case-sensitive).",
    difficulty: "easy"
  },
  {
    question: "What is the difference between local and global variables?",
    context: "Variable scope",
    answer: "Local variables are defined inside a function and only accessible within that function. Global variables are defined outside functions and accessible throughout the program. Use 'global' keyword to modify global variables inside functions.",
    difficulty: "easy"
  },
  {
    question: "What are Python operators?",
    context: "Operators and their types",
    answer: "Python operators include: Arithmetic (+, -, *, /, //, %, **), Comparison (==, !=, <, >, <=, >=), Logical (and, or, not), Assignment (=, +=, -=, etc.), Bitwise (&, |, ^, ~, <<, >>), Membership (in, not in), Identity (is, is not).",
    difficulty: "easy"
  },
  {
    question: "What is type conversion in Python?",
    context: "Converting between data types",
    answer: "Type conversion is changing one data type to another. Implicit conversion happens automatically (int + float = float). Explicit conversion uses functions like int(), float(), str(), list(), tuple().",
    difficulty: "easy"
  },
  {
    question: "What are control statements in Python?",
    context: "Flow control structures",
    answer: "Control statements manage program flow: Conditional (if, elif, else), Loops (for, while), Jump statements (break, continue, pass, return). They control execution order and decision-making in programs.",
    difficulty: "easy"
  },
  {
    question: "What is a function in Python?",
    context: "Function basics",
    answer: "A function is a reusable block of code that performs a specific task. Defined with 'def' keyword, can accept parameters, and may return values. Functions promote code reusability and modularity.",
    difficulty: "easy"
  },
  {
    question: "What are function arguments in Python?",
    context: "Function parameters and arguments",
    answer: "Arguments are values passed to functions. Types include: positional arguments, keyword arguments, default arguments, variable-length arguments (*args for non-keyword, **kwargs for keyword arguments).",
    difficulty: "easy"
  },
  {
    question: "What is a lambda function?",
    context: "Anonymous functions",
    answer: "Lambda functions are small, anonymous functions defined with 'lambda' keyword. Syntax: lambda arguments: expression. They're used for short, simple functions, often with map(), filter(), reduce().\n\nExample:\n```python\n# Basic lambda\nsquare = lambda x: x ** 2\nprint(square(5))  # 25\n\n# With map()\nnumbers = [1, 2, 3, 4, 5]\nsquared = list(map(lambda x: x ** 2, numbers))\nprint(squared)  # [1, 4, 9, 16, 25]\n\n# With filter()\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nprint(evens)  # [2, 4]\n\n# Multiple arguments\nadd = lambda x, y: x + y\nprint(add(3, 4))  # 7\n```",
    difficulty: "easy"
  },
  {
    question: "What is the difference between append() and extend() methods?",
    context: "List manipulation methods",
    answer: "append() adds a single element to the end of a list. extend() adds all elements from an iterable to the end of a list.\n\nExample:\n```python\nlist1 = [1, 2]\nlist2 = [1, 2]\n\nlist1.append([3, 4])\nprint(list1)  # [1, 2, [3, 4]]\n\nlist2.extend([3, 4])\nprint(list2)  # [1, 2, 3, 4]\n\n# extend() can take any iterable\nlist2.extend('ab')\nprint(list2)  # [1, 2, 3, 4, 'a', 'b']\n```",
    difficulty: "easy"
  },
  {
    question: "What is string formatting in Python?",
    context: "String manipulation techniques",
    answer: "String formatting creates formatted strings. Methods include: % formatting ('Hello %s' % name), str.format() ('Hello {}'.format(name)), f-strings (f'Hello {name}'), and template strings.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between remove(), del, and pop()?",
    context: "List element removal methods",
    answer: "remove() removes the first occurrence of a value. del removes an element by index or slice. pop() removes and returns an element by index (default: last element).",
    difficulty: "easy"
  },
  {
    question: "What are modules in Python?",
    context: "Code organization and reusability",
    answer: "Modules are files containing Python code (functions, classes, variables). They're imported using 'import' statement for code reusability. Python has built-in modules (math, os, sys) and user-defined modules.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between import and from...import?",
    context: "Module importing methods",
    answer: "import loads the entire module (access with module.function). from...import loads specific items (direct access). Example: import math vs from math import sqrt.",
    difficulty: "easy"
  },
  {
    question: "What is exception handling in Python?",
    context: "Error handling mechanisms",
    answer: "Exception handling manages runtime errors using try-except blocks. Structure: try (code that might fail), except (handle specific exceptions), else (runs if no exception), finally (always runs).",
    difficulty: "easy"
  },
  {
    question: "What is the difference between error and exception?",
    context: "Error types in Python",
    answer: "Errors are syntax mistakes preventing code execution. Exceptions are runtime errors that occur during execution but can be handled. Examples: SyntaxError vs NameError, TypeError, ValueError.",
    difficulty: "easy"
  },
  {
    question: "What is a class in Python?",
    context: "Object-oriented programming basics",
    answer: "A class is a blueprint for creating objects. It defines attributes (data) and methods (functions) that objects will have. Classes enable object-oriented programming principles like encapsulation and inheritance.",
    difficulty: "easy"
  },
  {
    question: "What is an object in Python?",
    context: "Object-oriented programming concepts",
    answer: "An object is an instance of a class. It has attributes (data) and methods (behavior) defined by its class. Everything in Python is an object, including numbers, strings, functions, and classes.",
    difficulty: "easy"
  },
  {
    question: "What is self in Python?",
    context: "Class method parameter",
    answer: "self is a reference to the current instance of a class. It's the first parameter in instance methods and is used to access instance attributes and methods. It's not a keyword but a convention.",
    difficulty: "easy"
  },
  {
    question: "What is __init__ method?",
    context: "Class constructor",
    answer: "__init__ is a special method (constructor) called when creating a new instance of a class. It initializes the object's attributes and is automatically called when an object is instantiated.",
    difficulty: "easy"
  },
  {
    question: "What is inheritance in Python?",
    context: "Object-oriented programming principle",
    answer: "Inheritance allows a class to inherit attributes and methods from another class. The child class (subclass) inherits from the parent class (superclass), promoting code reusability and hierarchy.",
    difficulty: "easy"
  },
  {
    question: "What is the difference between method and function?",
    context: "Functions vs methods",
    answer: "Functions are independent code blocks defined with 'def'. Methods are functions defined inside a class and operate on class instances. Methods always have 'self' as the first parameter.",
    difficulty: "easy"
  },
  {
    question: "What is polymorphism in Python?",
    context: "Object-oriented programming concept",
    answer: "Polymorphism allows objects of different classes to be treated as objects of a common base class. The same method name can behave differently for different classes, enabling flexible and extensible code.",
    difficulty: "easy"
  },
  {
    question: "What are built-in functions in Python?",
    context: "Pre-defined functions",
    answer: "Built-in functions are pre-defined functions available without importing. Examples: print(), len(), type(), range(), input(), str(), int(), float(), list(), dict(), max(), min(), sum(), sorted().",
    difficulty: "easy"
  },
  {
    question: "What is the range() function?",
    context: "Sequence generation",
    answer: "range() generates a sequence of numbers. Syntax: range(start, stop, step). Commonly used in for loops. Examples: range(5) gives 0-4, range(1,6) gives 1-5, range(0,10,2) gives 0,2,4,6,8.",
    difficulty: "easy"
  },
  {
    question: "What is the enumerate() function?",
    context: "Iteration with indices",
    answer: "enumerate() adds a counter to an iterable and returns it as an enumerate object. Useful for getting both index and value in loops. Example: for i, value in enumerate(['a','b','c']): print(i, value).",
    difficulty: "easy"
  },
  {
    question: "What is the zip() function?",
    context: "Parallel iteration",
    answer: "zip() combines multiple iterables element-wise into tuples. Example: zip([1,2,3], ['a','b','c']) gives [(1,'a'), (2,'b'), (3,'c')]. Useful for parallel iteration.",
    difficulty: "easy"
  },
  {
    question: "What is list comprehension?",
    context: "Concise list creation",
    answer: "List comprehension provides a concise way to create lists. Syntax: [expression for item in iterable if condition].\n\nExample:\n```python\n# Basic list comprehension\nsquares = [x**2 for x in range(10)]\nprint(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\n# With condition\nevens_squared = [x**2 for x in range(10) if x % 2 == 0]\nprint(evens_squared)  # [0, 4, 16, 36, 64]\n\n# Equivalent traditional loop\ntraditional = []\nfor x in range(10):\n    if x % 2 == 0:\n        traditional.append(x**2)\n\n# Nested loops\nmatrix = [[i*j for j in range(3)] for i in range(3)]\nprint(matrix)  # [[0, 0, 0], [0, 1, 2], [0, 2, 4]]\n\n# String manipulation\nwords = ['hello', 'world', 'python']\ncapitalized = [word.upper() for word in words]\nprint(capitalized)  # ['HELLO', 'WORLD', 'PYTHON']\n```",
    difficulty: "easy"
  },

  // MEDIUM QUESTIONS (36-70)
  {
    question: "What is the Global Interpreter Lock (GIL)?",
    context: "Python threading limitation",
    answer: "GIL is a mutex that protects Python objects, preventing multiple threads from executing Python code simultaneously. It ensures thread safety but limits CPU-bound multi-threading performance. I/O-bound tasks can still benefit from threading.",
    difficulty: "medium"
  },
  {
    question: "What are decorators in Python?",
    context: "Function and class modification",
    answer: "Decorators are functions that modify other functions or classes without changing their code. They use @ syntax and implement the wrapper pattern.\n\nExample:\n```python\n# Simple decorator\ndef my_decorator(func):\n    def wrapper(*args, **kwargs):\n        print(f'Calling {func.__name__}')\n        result = func(*args, **kwargs)\n        print(f'Finished {func.__name__}')\n        return result\n    return wrapper\n\n@my_decorator\ndef say_hello(name):\n    print(f'Hello, {name}!')\n\nsay_hello('Alice')\n# Output:\n# Calling say_hello\n# Hello, Alice!\n# Finished say_hello\n\n# Decorator with parameters\ndef repeat(times):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for _ in range(times):\n                result = func(*args, **kwargs)\n            return result\n        return wrapper\n    return decorator\n\n@repeat(3)\ndef greet():\n    print('Hello!')\n\ngreet()  # Prints 'Hello!' three times\n```",
    difficulty: "medium"
  },
  {
    question: "What are generators in Python?",
    context: "Memory-efficient iteration",
    answer: "Generators are functions that return an iterator using 'yield' keyword. They generate values on-demand, saving memory. They maintain state between calls.\n\nExample:\n```python\n# Generator function\ndef count_up_to(max_count):\n    count = 1\n    while count <= max_count:\n        yield count\n        count += 1\n\n# Using generator\ncounter = count_up_to(3)\nprint(next(counter))  # 1\nprint(next(counter))  # 2\nprint(next(counter))  # 3\n# print(next(counter))  # StopIteration\n\n# Generator expression\nsquares = (x**2 for x in range(5))\nprint(list(squares))  # [0, 1, 4, 9, 16]\n\n# Memory efficient - doesn't store all values\ndef fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\n# Infinite generator - only generates when needed\nfib = fibonacci()\nfor i, num in enumerate(fib):\n    if i >= 10:\n        break\n    print(num, end=' ')  # 0 1 1 2 3 5 8 13 21 34\n```",
    difficulty: "medium"
  },
  {
    question: "What is the difference between yield and return?",
    context: "Generator vs regular function behavior",
    answer: "return terminates a function and returns a value. yield pauses the function, returns a value, and resumes from where it left off on next call. yield creates generators for memory-efficient iteration.\n\nExample:\n```python\n# Function with return\ndef return_example():\n    print('Before return')\n    return 1\n    print('After return')  # This never executes\n\nprint(return_example())  # Before return\\n1\nprint(return_example())  # Before return\\n1 (starts fresh)\n\n# Generator with yield\ndef yield_example():\n    print('Before first yield')\n    yield 1\n    print('Between yields')\n    yield 2\n    print('After second yield')\n    yield 3\n\ngen = yield_example()\nprint(next(gen))  # Before first yield\\n1\nprint(next(gen))  # Between yields\\n2\nprint(next(gen))  # After second yield\\n3\n\n# Practical example - reading large file\ndef read_large_file(file_path):\n    with open(file_path) as file:\n        for line in file:\n            yield line.strip()  # Memory efficient, one line at a time\n\n# vs reading entire file\ndef read_entire_file(file_path):\n    with open(file_path) as file:\n        return file.readlines()  # Loads entire file into memory\n```",
    difficulty: "medium"
  },
  {
    question: "What are context managers in Python?",
    context: "Resource management",
    answer: "Context managers handle resource allocation and cleanup automatically. Implemented using __enter__ and __exit__ methods or @contextmanager decorator. Used with 'with' statement.\n\nExample:\n```python\n# Built-in context manager\nwith open('file.txt', 'w') as f:\n    f.write('Hello, World!')\n# File automatically closed, even if exception occurs\n\n# Custom context manager using class\nclass DatabaseConnection:\n    def __enter__(self):\n        print('Connecting to database')\n        self.connection = 'connected'\n        return self.connection\n    \n    def __exit__(self, exc_type, exc_val, exc_tb):\n        print('Closing database connection')\n        self.connection = None\n        # Return False to propagate exceptions\n        return False\n\nwith DatabaseConnection() as conn:\n    print(f'Using {conn}')\n# Output:\n# Connecting to database\n# Using connected\n# Closing database connection\n\n# Using contextmanager decorator\nfrom contextlib import contextmanager\n\n@contextmanager\ndef timer():\n    import time\n    start = time.time()\n    print('Timer started')\n    try:\n        yield\n    finally:\n        end = time.time()\n        print(f'Elapsed: {end - start:.2f}s')\n\nwith timer():\n    time.sleep(1)  # Some operation\n```",
    difficulty: "medium"
  },
  {
    question: "What is the difference between deep copy and shallow copy?",
    context: "Object copying mechanisms",
    answer: "Shallow copy creates a new object but references to nested objects remain the same. Deep copy creates completely independent copy including nested objects.\n\nExample:\n```python\nimport copy\n\n# Original list with nested objects\noriginal = [[1, 2, 3], [4, 5, 6]]\n\n# Shallow copy\nshallow = copy.copy(original)\n# or shallow = original.copy()\n# or shallow = list(original)\n\n# Deep copy\ndeep = copy.deepcopy(original)\n\n# Modify nested object\noriginal[0][0] = 'X'\n\nprint('Original:', original)  # [['X', 2, 3], [4, 5, 6]]\nprint('Shallow: ', shallow)   # [['X', 2, 3], [4, 5, 6]] - affected!\nprint('Deep:    ', deep)      # [[1, 2, 3], [4, 5, 6]] - not affected\n\n# Test object identity\nprint('original[0] is shallow[0]:', original[0] is shallow[0])  # True\nprint('original[0] is deep[0]:   ', original[0] is deep[0])     # False\n\n# With custom objects\nclass Person:\n    def __init__(self, name, friends):\n        self.name = name\n        self.friends = friends\n\nalice = Person('Alice', ['Bob', 'Charlie'])\nshallow_alice = copy.copy(alice)\ndeep_alice = copy.deepcopy(alice)\n\nalice.friends.append('David')\nprint('Original friends:', alice.friends)        # ['Bob', 'Charlie', 'David']\nprint('Shallow friends: ', shallow_alice.friends) # ['Bob', 'Charlie', 'David']\nprint('Deep friends:    ', deep_alice.friends)    # ['Bob', 'Charlie']\n```",
    difficulty: "medium"
  },
  {
    question: "What are magic methods or dunder methods?",
    context: "Special methods in Python classes",
    answer: "Magic methods are special methods with double underscores (e.g., __init__, __str__, __len__). They define how objects behave with built-in functions and operators, enabling operator overloading and customization.",
    difficulty: "medium"
  },
  {
    question: "What is method resolution order (MRO)?",
    context: "Multiple inheritance in Python",
    answer: "MRO determines the order in which methods are inherited in multiple inheritance. Python uses C3 linearization algorithm. Check with ClassName.__mro__ or ClassName.mro(). Follows depth-first, left-to-right order.",
    difficulty: "medium"
  },
  {
    question: "What are metaclasses in Python?",
    context: "Classes that create classes",
    answer: "Metaclasses are classes whose instances are classes. They control class creation and can modify class behavior. Default metaclass is 'type'. Custom metaclasses use __new__ and __init__ methods to customize class creation.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between @staticmethod and @classmethod?",
    context: "Class method decorators",
    answer: "@staticmethod doesn't receive any implicit arguments (no self/cls). @classmethod receives the class as first argument (cls). Static methods are utility functions, class methods can access class attributes.",
    difficulty: "medium"
  },
  {
    question: "What are descriptors in Python?",
    context: "Attribute access control",
    answer: "Descriptors are objects that define how attribute access is handled through __get__, __set__, and __delete__ methods. They're used to implement properties, methods, and attribute validation.",
    difficulty: "medium"
  },
  {
    question: "What is monkey patching?",
    context: "Runtime code modification",
    answer: "Monkey patching is dynamically modifying classes or modules at runtime. It allows adding, modifying, or deleting attributes and methods without changing original source code. Useful for testing and extending functionality.",
    difficulty: "medium"
  },
  {
    question: "What are closures in Python?",
    context: "Function scope and nested functions",
    answer: "Closures are nested functions that capture and remember values from their enclosing scope, even after the outer function returns. They maintain access to outer variables, enabling powerful programming patterns.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between map(), filter(), and reduce()?",
    context: "Functional programming tools",
    answer: "map() applies a function to each item in an iterable. filter() filters items based on a condition. reduce() (from functools) applies a function cumulatively to reduce an iterable to a single value.",
    difficulty: "medium"
  },
  {
    question: "What are iterators and iterables?",
    context: "Iteration protocol",
    answer: "Iterables are objects that can be iterated over (implement __iter__). Iterators are objects that produce values one at a time (implement __iter__ and __next__). All iterators are iterables, but not all iterables are iterators.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between __str__ and __repr__?",
    context: "String representation methods",
    answer: "__str__ provides human-readable string representation for end users. __repr__ provides unambiguous string representation for developers/debugging. If __str__ is not defined, __repr__ is used as fallback.",
    difficulty: "medium"
  },
  {
    question: "What are slots in Python?",
    context: "Memory optimization for classes",
    answer: "__slots__ restricts instance attributes to a fixed set, saving memory by avoiding __dict__ creation. It prevents dynamic attribute addition but improves memory usage and access speed for classes with many instances.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between sort() and sorted()?",
    context: "List sorting methods",
    answer: "sort() is a list method that sorts in-place and returns None. sorted() is a built-in function that returns a new sorted list without modifying the original. sorted() works with any iterable.",
    difficulty: "medium"
  },
  {
    question: "What are coroutines in Python?",
    context: "Asynchronous programming",
    answer: "Coroutines are functions that can pause and resume execution, enabling cooperative multitasking. Defined with 'async def' and use 'await' for asynchronous operations. They're the foundation of asyncio programming.",
    difficulty: "medium"
  },
  {
    question: "What is the asyncio module?",
    context: "Asynchronous I/O framework",
    answer: "asyncio provides infrastructure for asynchronous programming using coroutines, event loops, and futures. It's designed for I/O-bound tasks and enables concurrent execution without threads or multiprocessing.",
    difficulty: "medium"
  },
  {
    question: "What are abstract base classes (ABC)?",
    context: "Interface definition in Python",
    answer: "ABCs define interfaces that subclasses must implement. Using abc module, you can create abstract methods with @abstractmethod decorator. Classes with abstract methods cannot be instantiated directly.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between mutable and immutable objects?",
    context: "Object mutability concepts",
    answer: "Mutable objects can be changed after creation (lists, dicts, sets). Immutable objects cannot be changed (strings, tuples, frozensets, numbers). Immutable objects are hashable and can be dictionary keys.",
    difficulty: "medium"
  },
  {
    question: "What are named tuples?",
    context: "Enhanced tuple with named fields",
    answer: "Named tuples are tuple subclasses with named fields, providing readable and self-documenting code. Created using collections.namedtuple(). They're immutable but more readable than regular tuples.",
    difficulty: "medium"
  },
  {
    question: "What is the collections module?",
    context: "Specialized container datatypes",
    answer: "collections provides specialized containers: Counter (counting), defaultdict (default values), OrderedDict (insertion order), deque (double-ended queue), namedtuple (named fields), ChainMap (multiple mappings).",
    difficulty: "medium"
  },
  {
    question: "What are data classes in Python?",
    context: "Simplified class creation",
    answer: "Data classes (using @dataclass decorator) automatically generate __init__, __repr__, __eq__, and other methods based on class annotations. They reduce boilerplate code for classes that primarily store data.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between pickle and JSON?",
    context: "Serialization methods",
    answer: "Pickle serializes Python objects into binary format, supporting complex objects but Python-specific. JSON serializes data into text format, human-readable and language-independent but limited to basic data types.",
    difficulty: "medium"
  },
  {
    question: "What are weakref objects?",
    context: "Weak references to avoid circular references",
    answer: "Weak references don't prevent object deletion and don't increase reference count. They're useful for avoiding circular references, implementing caches, and observer patterns without keeping objects alive unnecessarily.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between threading and multiprocessing?",
    context: "Concurrency models",
    answer: "Threading uses shared memory within a single process but is limited by GIL for CPU-bound tasks. Multiprocessing uses separate processes with isolated memory, better for CPU-bound tasks but higher overhead.",
    difficulty: "medium"
  },
  {
    question: "What are regular expressions in Python?",
    context: "Pattern matching with re module",
    answer: "Regular expressions provide pattern matching for strings using re module. Common functions: re.match(), re.search(), re.findall(), re.sub(). Patterns use metacharacters like ., *, +, ?, [], (), |, ^, $.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between unittest and pytest?",
    context: "Testing frameworks",
    answer: "unittest is built-in, class-based, follows xUnit pattern. pytest is third-party, function-based, more concise with better fixtures, parameterization, and plugins. pytest can run unittest tests but not vice versa.",
    difficulty: "medium"
  },
  {
    question: "What are property decorators?",
    context: "Attribute access control",
    answer: "Property decorators (@property) allow methods to be accessed like attributes while maintaining encapsulation. They enable getter, setter, and deleter methods for computed properties and attribute validation.",
    difficulty: "medium"
  },
  {
    question: "What is the difference between json.load() and json.loads()?",
    context: "JSON parsing methods",
    answer: "json.load() reads JSON from a file-like object (file, URL). json.loads() parses JSON from a string. Similarly, json.dump() writes to file, json.dumps() returns a string.",
    difficulty: "medium"
  },
  {
    question: "What are type hints in Python?",
    context: "Static type checking",
    answer: "Type hints provide optional static type information using typing module. They improve code readability, enable IDE support, and work with tools like mypy for static type checking. Examples: def func(x: int) -> str:",
    difficulty: "medium"
  },
  {
    question: "What is the difference between args and kwargs?",
    context: "Variable-length arguments",
    answer: "*args captures variable positional arguments into a tuple. **kwargs captures variable keyword arguments into a dictionary. They enable flexible function signatures and argument forwarding.",
    difficulty: "medium"
  },
  {
    question: "What are virtual environments?",
    context: "Python environment isolation",
    answer: "Virtual environments create isolated Python installations with separate package sets. Tools include venv (built-in), virtualenv, conda. They prevent package conflicts and enable project-specific dependencies.",
    difficulty: "medium"
  },

  // HARD QUESTIONS (71-100)
  {
    question: "Explain Python's memory management and garbage collection.",
    context: "Memory allocation and deallocation",
    answer: "Python uses reference counting with cycle detection. Objects are deallocated when reference count reaches zero. Garbage collector handles circular references using generational collection with three generations. Memory pools optimize small object allocation.",
    difficulty: "hard"
  },
  {
    question: "What is the difference between new-style and old-style classes?",
    context: "Class implementation differences",
    answer: "Old-style classes (Python 2) don't inherit from object. New-style classes inherit from object, support descriptors, properties, static/class methods, and consistent MRO. Python 3 only has new-style classes.",
    difficulty: "hard"
  },
  {
    question: "How does Python's import system work?",
    context: "Module loading mechanism",
    answer: "Import system uses sys.path to find modules, creates module objects, executes code, and caches in sys.modules. Process involves finding, loading, and executing modules. Import hooks and meta path finders customize behavior.",
    difficulty: "hard"
  },
  {
    question: "What are the different ways to create threads in Python?",
    context: "Threading implementation approaches",
    answer: "Threading approaches: threading.Thread class (subclass or target function), threading module functions, concurrent.futures.ThreadPoolExecutor, asyncio for I/O-bound tasks. Each has different use cases and overhead.",
    difficulty: "hard"
  },
  {
    question: "Explain the Global Interpreter Lock (GIL) in detail.",
    context: "Deep dive into GIL mechanism",
    answer: "GIL is a recursive lock protecting Python object access. Only one thread executes Python code at a time. It simplifies memory management but limits CPU-bound multithreading. Released during I/O operations and C extensions.",
    difficulty: "hard"
  },
  {
    question: "How do you optimize Python code performance?",
    context: "Performance optimization techniques",
    answer: "Optimization strategies: profile code (cProfile, line_profiler), use appropriate data structures, vectorize with NumPy, optimize algorithms, use built-ins, compile with Cython/Numba, parallelize I/O operations, cache results.",
    difficulty: "hard"
  },
  {
    question: "What are the differences between CPython, PyPy, and Jython?",
    context: "Python implementation comparison",
    answer: "CPython: reference implementation in C, most compatible. PyPy: just-in-time compiler, faster execution. Jython: runs on JVM, Java integration. IronPython: .NET integration. Each has different performance characteristics and compatibility.",
    difficulty: "hard"
  },
  {
    question: "Explain Python's descriptor protocol in detail.",
    context: "Advanced attribute access control",
    answer: "Descriptors define __get__, __set__, __delete__ methods. Data descriptors have __set__/__delete__, non-data descriptors only __get__. MRO for attribute access: data descriptors, instance dict, non-data descriptors, class dict, __getattr__.",
    difficulty: "hard"
  },
  {
    question: "How does Python's garbage collector handle circular references?",
    context: "Circular reference detection and cleanup",
    answer: "Python uses mark-and-sweep algorithm with generational collection. Objects are divided into three generations based on survival rate. Circular references are detected by tracking unreachable objects and cleaning them periodically.",
    difficulty: "hard"
  },
  {
    question: "What are the different types of inheritance in Python?",
    context: "Inheritance patterns and their implications",
    answer: "Single inheritance (one parent), multiple inheritance (multiple parents), multilevel inheritance (chain), hierarchical inheritance (multiple children), hybrid inheritance (combination). Diamond problem solved by MRO.",
    difficulty: "hard"
  },
  {
    question: "Explain the asyncio event loop and its components.",
    context: "Asynchronous programming architecture",
    answer: "Event loop manages and executes coroutines, callbacks, and I/O operations. Components: selector (I/O multiplexing), ready queue (scheduled callbacks), executor (thread/process pools), future objects (async results).",
    difficulty: "hard"
  },
  {
    question: "How do you implement custom iterators and generators?",
    context: "Iterator protocol implementation",
    answer: "Custom iterators implement __iter__ and __next__ methods. Generators use yield statements or generator expressions. Generator objects are iterators with built-in state management and StopIteration handling.",
    difficulty: "hard"
  },
  {
    question: "What are the security considerations in Python applications?",
    context: "Security best practices",
    answer: "Security concerns: input validation, SQL injection prevention, secure deserialization, proper authentication, HTTPS usage, environment variable protection, dependency scanning, code injection prevention, principle of least privilege.",
    difficulty: "hard"
  },
  {
    question: "Explain Python's compilation process from source to bytecode.",
    context: "Code execution pipeline",
    answer: "Process: lexical analysis (tokenization), syntax analysis (AST generation), compilation (bytecode generation), interpretation (PVM execution). .pyc files cache bytecode. Modules compiled on import, functions compiled when defined.",
    difficulty: "hard"
  },
  {
    question: "How do you implement design patterns in Python?",
    context: "Object-oriented design patterns",
    answer: "Common patterns: Singleton (metaclass/__new__), Factory (class methods), Observer (weak references), Decorator (functools.wraps), Strategy (function objects), Command (callable objects). Python's flexibility enables elegant implementations.",
    difficulty: "hard"
  },
  {
    question: "What are the advanced features of Python's typing system?",
    context: "Complex type annotations",
    answer: "Advanced typing: Generic types, Protocol classes, TypeVar, Union, Optional, Literal, Final, overload, TYPE_CHECKING, runtime type checking with typing_extensions, structural subtyping.",
    difficulty: "hard"
  },
  {
    question: "How do you handle memory leaks in Python applications?",
    context: "Memory leak detection and prevention",
    answer: "Memory leak sources: circular references, unclosed resources, global variables, callback references. Detection tools: objgraph, memory_profiler, tracemalloc. Prevention: proper resource management, weak references, explicit cleanup.",
    difficulty: "hard"
  },
  {
    question: "Explain the internals of Python dictionaries.",
    context: "Dictionary implementation details",
    answer: "Dictionaries use open addressing with random probing. Compact representation since Python 3.6 maintains insertion order. Hash collision resolution, load factor management, and key sharing optimization for memory efficiency.",
    difficulty: "hard"
  },
  {
    question: "How do you implement custom metaclasses and their use cases?",
    context: "Advanced metaprogramming",
    answer: "Metaclasses control class creation through __new__ and __init__. Use cases: automatic registration, validation, API creation, ORM implementation, singleton enforcement. Alternative: __init_subclass__ for simpler cases.",
    difficulty: "hard"
  },
  {
    question: "What are the differences between synchronous and asynchronous programming models?",
    context: "Concurrency paradigms comparison",
    answer: "Synchronous: blocking execution, simpler debugging, natural flow. Asynchronous: non-blocking, better I/O performance, complex error handling. Python supports both through threading, multiprocessing, and asyncio.",
    difficulty: "hard"
  },
  {
    question: "How do you implement distributed systems with Python?",
    context: "Distributed computing approaches",
    answer: "Tools and approaches: Celery (task queues), multiprocessing, Ray (distributed computing), Dask (parallel computing), gRPC/REST APIs, message brokers (Redis, RabbitMQ), microservices architecture.",
    difficulty: "hard"
  },
  {
    question: "Explain Python's buffer protocol and memoryview objects.",
    context: "Low-level memory access",
    answer: "Buffer protocol allows efficient data sharing without copying. memoryview provides buffer interface to objects supporting buffer protocol. Enables zero-copy operations for large data sets, useful for performance-critical applications.",
    difficulty: "hard"
  },
  {
    question: "How do you implement custom context managers?",
    context: "Resource management patterns",
    answer: "Context managers implement __enter__ and __exit__ methods. Alternative: @contextmanager decorator with try/finally. Use cases: resource management, transaction handling, temporary state changes, error suppression.",
    difficulty: "hard"
  },
  {
    question: "What are the challenges and solutions for deploying Python applications?",
    context: "Production deployment considerations",
    answer: "Challenges: dependency management, performance, scalability, monitoring. Solutions: containerization (Docker), virtual environments, WSGI/ASGI servers (Gunicorn, Uvicorn), reverse proxies, load balancing, CI/CD pipelines.",
    difficulty: "hard"
  },
  {
    question: "How do you implement efficient data processing pipelines in Python?",
    context: "Data processing optimization",
    answer: "Strategies: streaming processing, chunked reading, parallel processing (multiprocessing/asyncio), memory mapping, efficient data structures (NumPy, Pandas), pipeline patterns, lazy evaluation, caching.",
    difficulty: "hard"
  },
  {
    question: "Explain the differences between various Python web frameworks.",
    context: "Web framework comparison and selection",
    answer: "Django: full-featured, batteries-included, ORM. Flask: lightweight, flexible, microframework. FastAPI: modern, async, automatic API docs. Tornado: asynchronous, real-time features. Choice depends on project requirements and complexity.",
    difficulty: "hard"
  },
  {
    question: "How do you implement caching strategies in Python applications?",
    context: "Caching mechanisms and patterns",
    answer: "Caching levels: application (functools.lru_cache), memory (Redis, Memcached), database query caching, HTTP caching. Strategies: LRU, TTL, write-through, write-behind. Tools: Redis, Memcached, Django cache framework.",
    difficulty: "hard"
  },
  {
    question: "What are the best practices for Python package development and distribution?",
    context: "Package creation and management",
    answer: "Best practices: proper project structure, setup.py/pyproject.toml, version management, testing, documentation, continuous integration, semantic versioning, PyPI distribution, dependency management, security considerations.",
    difficulty: "hard"
  },
  {
    question: "How do you implement monitoring and logging in Python applications?",
    context: "Application observability",
    answer: "Logging: structured logging (JSON), log levels, formatters, handlers. Monitoring: metrics collection, health checks, performance monitoring. Tools: logging module, structlog, Prometheus, Grafana, APM tools (New Relic, DataDog).",
    difficulty: "hard"
  },
  {
    question: "Explain the advanced features of Python's unittest framework.",
    context: "Advanced testing techniques",
    answer: "Advanced features: test discovery, fixtures (setUp/tearDown), test suites, mocking (unittest.mock), parameterized tests, test skipping, custom assertions, test runners, coverage analysis, integration with CI/CD.",
    difficulty: "hard"
  }
];

module.exports = pythonQuestions;