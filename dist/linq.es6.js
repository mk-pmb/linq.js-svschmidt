/*!
 * linqjs v0.0.0
 * (c) Sven Schmidt 
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
(function () {
  'use strict';

  // this || (0, eval)('this') is a robust way for getting a reference
  // to the global object
  const window = this || (0, eval)('this'); // jshint ignore:line
  const DEBUG = false;

(function (factory) {
  try {
    if (typeof define === 'function' && define.amd) {
      // AMD asynchronous module definition (e.g. requirejs)
      define(['require', 'exports'], factory)
    } else if (exports && module && module.exports) {
      // CommonJS/Node.js where module.exports is for nodejs
      factory(exports || module.exports)
    }
  } catch (err) {
    // no module loader (simple <script>-tag) -> assign Maybe directly to the global object
    // -> (0, eval)('this') is a robust way for getting a reference to the global object
    factory(window.linqjs = {}) // jshint ignore:line
  }
}(function (linqjs) {


/* src/helpers/defaults.js */

function defaultEqualityCompareFn (first, second) {
  return toJSON(first) === toJSON(second)
}

/**
 * Default comparator implementation that uses the "<" operator.
 * Retuns values as specified by the comparator function fir Array.sort().
 *
 * @param  {T}  a   Element "a" to be compared.
 * @param  {T}  b   Element "b" to be compared.
 * @param {any} <T> Element type.
 *
 * @return {number} Returns -1 if "a" is smaller than "b",
 *                  returns  1 if "b" is smaller than "a",
 *                  returns  0 if they are equal.
 */
function DefaultComparator (a, b) {
    if (a < b) {
        return -1;
    }
    if (b < a) {
        return 1;
    }
    return 0;
};




/* src/helpers/assert.js */

  function __assert (condition, msg) {
    if (!condition) {
      throw new Error(msg);
    }
  }

  function __assertFunction (param) {
    __assert(isFunction(param), 'Parameter must be function!')
  }

  function __assertArray (param) {
    __assert(isArray(param), 'Parameter must be array!')
  }

  function __assertNotEmpty (coll) {
    __assert(!isEmpty(coll), 'Sequence is empty')
  }

  function __assertIterable (obj) {
    __assert(isIterable(obj), 'Parameter must be iterable!')
  }

  function __assertCollection (obj) {
    __assert(isCollection(obj), 'Pa>rameter must be collection!')
  }

  function __assertIterationNotStarted (collection) {
    __assert(!(collection.hasOwnProperty('StartedIterating') && collection.StartedIterating()), 'Iteration already started!')
  }

  function __assertString (obj) {
    __assert(isString(obj), 'Parameter must be string!')
  }

  function __assertIndexInRange(coll, index) {
    __assertCollection(coll)
    __assert(isNumeric(index), 'Index must be number!')
    __assert(index >= 0 && index < coll.Count(), 'Index is out of bounds')
  }


/* src/helpers/is.js */

  function isArray (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }

  function isFunction (obj) {
    return typeof obj === 'function'
  }

  function isNumeric (n) {
    return !isNaN(parseFloat(n))
  }

  function isEmpty (coll) {
    if (isCollection(coll)) {
      return isEmpty(coll.Take(1))
    }

    return coll.length === 0
  }

  function isIterable (obj) {
    return (Symbol.iterator in obj)
  }

  function isString (obj) {
    return typeof obj === 'string';
  }

  function isCollection (obj) {
    return obj instanceof Collection
  }

  function isGenerator (obj) {
    return Object.prototype.toString.call(obj) === '[object GeneratorFunction]'
  }


/* src/helpers/helpers.js */

  function toJSON (obj) {
    return JSON.stringify(obj)
  }

  function __assign (target, source) {
    target = Object(target);

    if (Object.hasOwnProperty('assign') && typeof Object.assign === 'function') {
      Object.assign(target, source)
    } else {
      Object.keys(source).forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      })
    }

    return target
  }

  function __export (obj) {
    __assign(linqjs, obj)
  }

  function symbolOrString (str) {
    if (DEBUG) {
      return str
    } else {
      return Symbol(str)
    }
  }

  /**
   * paramOrValue - Helper method to get the passed parameter or a default value if it is undefined
   *
   * @param  {any} param The parameter to check
   * @param  {any} value Value to return when param is undefined
   * @return {any}
   */
  function paramOrValue(param, value) {
    return typeof param === 'undefined'
      ? value
      : param
  }

  function aggregateCollection (coll, seed, accumulator, resultTransformFn) {
    __assertFunction(accumulator)
    __assertFunction(resultTransformFn)
    __assertNotEmpty(coll)

    return resultTransformFn([seed].concat(coll).reduce(accumulator))
  }

  function removeDuplicates (coll, equalityCompareFn = defaultEqualityCompareFn) {
    __assertIterable(coll)
    __assertFunction(equalityCompareFn)

    const previous = []

    return new Collection(function * () {
      coll.reset()

      outer: for (let val of coll) {
        inner: for (let prev of previous) {
          if (equalityCompareFn(val, prev)) {
            continue outer;
          }
        }

        previous.push(val)

        yield val
      }
    }())
  }

  /**
   * emptyArray - Helper function to remove all elements from an array (by modifying the original and not returning a new one)
   *
   * @param  {Array} arr The array to remove all elements form
   * @return {void}
   */
  function emptyArray (arr) {
    __assertArray(arr)

    while (arr.shift()) {}
  }

  function removeFromArray (arr, value) {
    __assertArray(arr)

    let elemsBefore = []
    let elemFound = false
    let current

    // remove all elements from the array (shift) and push them into a temporary variable until the desired element was found
    while ((current = arr.shift()) && !(elemFound = defaultEqualityCompareFn(current, value))) {
      elemsBefore.push(current)
    }

    // add the temporary values back to the array (to the front)
    // -> unshift modifies the original array instead of returning a new one
    arr.unshift(...elemsBefore)

    return elemFound
  }

  const nativeConstructors = [
    Object, Number, Boolean, String, Symbol
  ]

  function isNative (obj) {
    return /native code/.test(Object(obj).toString()) || !!~nativeConstructors.indexOf(obj)
  }

  function getDefault (constructorOrValue = Object) {
    if (constructorOrValue && isNative(constructorOrValue) && typeof constructorOrValue === 'function') {
      let defaultValue = constructorOrValue()

      if (defaultValue instanceof Object || constructorOrValue === Date) {
        return null
      } else {
        return defaultValue
      }
    }

    return constructorOrValue
  }

  function getParameterCount (fn) {
    __assertFunction(fn)

    return fn.length
  }


/* src/linq.js */

const getIterator = symbolOrString('getIterator')

window.Collection = (function () {
  function Collection (iterableOrGenerator) {
    __assert(isIterable(iterableOrGenerator) || isGenerator(iterableOrGenerator), 'Parameter must be iterable or generator!')

    this.iterable = iterableOrGenerator
  }

  Collection.from = function (iterable) {
    return new Collection(iterable)
  }

  Collection.prototype = (function () {
    function next () {
      if (!this.started) {
        this.started = true
        this.iterator = this[getIterator]()
      }

      return this.iterator.next()
    }

    function reset () {
      this.started = false
    }

    function ToArray() {
      const result = [...this]
      this.reset()

      return result
    }

    return { next, reset }
  }())

  Collection.prototype[Symbol.iterator] = function * () {
    let current

    while (true) {
      current = this.next()

      if (current.done) {
        this.reset()
        break
      }

      yield current.value
    }
  }

  Collection.prototype[getIterator] = function () {
    const iter = this.iterable

    if (isGenerator(iter)) {
      return iter()
    } else {
      return function * () {
        yield* iter
      }()
    }
  }

  return Collection
}())

function install () {
  __assign(Collection.prototype, linqjs)

  // inheritance stuff (we don't want to implement stuff twice)
  OrderedLinqCollection.prototype = __assign(__assign({}, Collection.prototype), OrderedLinqCollection.prototype);
  OrderedLinqCollection.prototype.constructor = OrderedLinqCollection;

  const protosToApplyWrappers = [window.Array.prototype, window.Set.prototype, window.Map.prototype]

  Object.keys(linqjs).forEach(k => {
    for (let proto of protosToApplyWrappers) {
      proto[k] = function (...args) {
        return new Collection(this)[k](...args)
      }
    }
  })
}




/* src/math.js */

  function Min (mapFn = x => x) {
    __assertFunction(mapFn)
    __assertNotEmpty(this)

    return Math.min.apply(null, this.Select(mapFn).ToArray())
  }

  function Max (mapFn = x => x) {
    __assertFunction(mapFn)
    __assertNotEmpty(this)

    return Math.max.apply(null, this.Select(mapFn).ToArray())
  }

  function Sum() {
    __assertNotEmpty(this)

    return this.Aggregate(0, (prev, curr) => prev + curr)
  }

  function Average () {
    __assertNotEmpty(this)

    return this.Sum() / this.Count()
  }




/* src/concatenation.js */

  function Concat (second) {
    __assertIterable(second)

    const _self = this

    if (!isCollection(second)) {
      second = new Collection(second)
    }

    return new Collection(function * () {
      yield* _self
      yield* second
    }())
  }

  function Union (second, equalityCompareFn = defaultEqualityCompareFn) {
    __assertIterable(second)

    return this.Concat(second).Distinct(equalityCompareFn)
  }

  /**
   * Join - Correlates the elements of two sequences based on matching keys
   *
   * @see https://msdn.microsoft.com/de-de/library/bb534675(v=vs.110).aspx
   * @param  {iterable} second               The second sequence to join with the first one
   * @param  {Function} firstKeySelector     A selector fn to extract the key from the first sequence
   * @param  {Function} secondKeySelector    A selector fn to extract the key from the second sequence
   * @param  {Function} resultSelectorFn     A fn to transform the pairings into the result
   * @param  {Function} keyEqualityCompareFn Optional fn to compare the keys
   * @return {Collection}                      A new collection of the resulting pairs
   */
  function Join (second, firstKeySelector, secondKeySelector, resultSelectorFn, keyEqualityCompareFn) {
    __assertIterable(second)
    __assertFunction(firstKeySelector)
    __assertFunction(secondKeySelector)
    __assertFunction(resultSelectorFn)
    keyEqualityCompareFn = paramOrValue(keyEqualityCompareFn, defaultEqualityCompareFn)
    __assertFunction(keyEqualityCompareFn)

    const first = this

    const result = Collection.from(function * () {
      for (let firstValue of first) {
        const firstKey = firstKeySelector(firstValue)

        for (let secondValue of second) {
          const secondKey = secondKeySelector(secondValue)

          if (keyEqualityCompareFn(firstKey, secondKey)) {
            yield resultSelectorFn(firstValue, secondValue)
          }
        }
      }
    })

    this.reset()
    second.reset && second.reset()

    return result
  }




/* src/search.js */

function Contains (elem) {
  for (let val of this) {
    if (defaultEqualityCompareFn(elem, val)) {
      return true
    }
  }

  this.reset()

  return false
}

function Where (predicate = (elem, index) => true) {
  __assertFunction(predicate)

  const _self = this

  return new Collection(function * () {
    let index = 0

    for (let val of _self) {
      if (predicate(val, index)) {
        yield val
      }

      index++
    }
  }())
}

/**
 * Count - Returns the amount of elements matching a predicate or the array length if no parameters given
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.count(v=vs.110).aspx
 * @param  {Function} predicate
 * @return {Number}
 */
function Count (predicate = elem => true) {
  return this.Where(predicate).ToArray().length
}

/**
 * Any - Returns true if at least one element matches the predicate or if no predicate is given but the sequence contains at least one element
 *
 * @see https://msdn.microsoft.com/de-de/library/bb337697(v=vs.110).aspx
 * @param  {Function} predicate
 * @return {Boolean}
 */
function Any (predicate) {
  if (isEmpty(this)) {
    return false
  }

  if (!predicate) {
    // since we checked before that the sequence is not empty
    return true
  }

  return this.Count(predicate) > 0
}

/**
 * All - Returns true if all elements match the predicate
 *
 * @see https://msdn.microsoft.com/de-de/library/bb548541(v=vs.110).aspx
 * @param  {Function} predicate
 * @return {Boolean}
 */
function All (predicate = elem => true) {
  __assertFunction(predicate)

  // All is equal to the question if there's no element which does not match the predicate
  // 'all fruits are yellow' -> 'there is no fruit which is not yellow'
  return !this.Any(x => !predicate(x))
}




/* src/access.js */

/**
 * ElementAt - Returns the element at the given index
 *
 * @see https://msdn.microsoft.com/de-de/library/bb299233(v=vs.110).aspx
 * @param  {Number} index
 * @return {any}
 */
function ElementAt (index) {
  __assertIndexInRange(this, index)
  __assert(isNumeric(index), 'Index must be numeric!')

  const result = this.Skip(index).Take(1)[0]
  this.reset()

  return result
}

/**
 * Take - Returns count elements of the sequence starting from the beginning
 *
 * @see https://msdn.microsoft.com/de-de/library/bb503062(v=vs.110).aspx
 * @param  {Number} count = 0 number of elements to be returned
 * @return {Array}
 */
function Take (count = 0) {
  __assert(isNumeric(count), 'First parameter must be numeric!')

  if (count <= 0) {
    return []
  }

  let result = []

  for (let val of this) {
    result.push(val)

    if (result.length === count) {
      break
    }
  }

  this.reset()

  return result
}

/**
 * Skip - Skips count elements of the sequence and returns the remaining ones
 *
 * @see https://msdn.microsoft.com/de-de/library/bb358985(v=vs.110).aspx
 * @param  {Nu,ber count = 0 amount of elements to skip
 * @return {Array}
 */
function Skip (count = 0) {
  __assert(isNumeric(count), 'First parameter must be numeric!')

  if (count <= 0) {
    return this
  }

  const result = this.SkipWhile((elem, index) => index < count)

  this.reset()

  return result
}

/**
 * TakeWhile - Takes elements from the beginning of a sequence until the predicate yields false for an element
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.takewhile(v=vs.110).aspx
 * @param  {Function} predicate     the predicate of the form elem => boolean or (elem, index) => boolean
 * @return {Array}
 */
function TakeWhile (predicate = (elem, index) => true) {
  __assertFunction(predicate)

  const _self = this

  const result = new Collection(function * () {
    let index = 0
    let endTake = false

    for (let val of _self) {
      if (!endTake && predicate(val, index++)) {
        yield val
        continue
      }

      endTake = true
    }
  }).ToArray()

  this.reset()

  return result
}

/**
 * SkipWhile - Skips elements in the array until the predicate yields false and returns the remaining elements
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.skipwhile(v=vs.110).aspx
 * @param  {type} predicate         the predicate of the form elem => boolean or (elem, index) => boolean
 * @return {Array}
 */
function SkipWhile (predicate = (elem, index) => true) {
  __assertFunction(predicate)

  const _self = this

  const result = new Collection(function * () {
    let index = 0
    let endSkip = false

    for (let val of _self) {
      if (!endSkip && predicate(val, index++)) {
        continue
      }

      endSkip = true
      yield val
    }
  })

  this.reset()

  return result
}

function First (predicate = x => true) {
  __assertFunction(predicate)
  __assertNotEmpty(this)

  const result = this.SkipWhile(elem => !predicate(elem)).Take(1)
  this.reset()

  return result[0]
}

function resultOrDefault(collection, originalFn, predicateOrConstructor = x => true, constructor = Object) {
  //__assertArray(arr)

  let predicate

  if (isNative(predicateOrConstructor)) {
    predicate = x => true
    constructor = predicateOrConstructor
  } else {
    predicate = predicateOrConstructor
  }

  __assertFunction(predicate)
  __assert(isNative(constructor), 'constructor must be native constructor, e.g. Number!')

  const defaultVal = getDefault(constructor)

  if (isEmpty(collection)) {
    return defaultVal
  }

  let result = originalFn.call(collection, predicate)

  if (result) {
    return result
  }

  return defaultVal
}

function FirstOrDefault (predicateOrConstructor = x => true, constructor = Object) {
  return resultOrDefault(this, First, predicateOrConstructor, constructor)
}

function Last (predicate = x => true) {
  //__assertFunction(predicate)
  //__assertNotEmpty(this)

  return new Collection(this.ToArray().reverse()).First(predicate)
}

function LastOrDefault (predicateOrConstructor = x => true, constructor = Object) {
  return resultOrDefault(this, Last, predicateOrConstructor, constructor)
}

function Single (predicate = x => true) {
  __assertFunction(predicate)
  __assertNotEmpty(this)

  let index = 0
  let result

  for (let val of this) {
    if (predicate(val)) {
      result = val
      break
    }

    index++
  }

  this.reset()

  if (this.First(elem => predicate(elem) && !defaultEqualityCompareFn(elem, result))) {
    throw new Error('Sequence contains more than one element')
  }

  return result
}

function SingleOrDefault (predicateOrConstructor = x => true, constructor = Object) {
  return resultOrDefault(this, Single, predicateOrConstructor, constructor)
}

/**
 * DefaultIfEmpty - Returns the array or a new array containing the provided constructors default if empty
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.defaultifempty(v=vs.110).aspx
 * @param {Function} constructor A native constructor to get the default for, e.g. Number
 * @return {Array}
 *//**
 * DefaultIfEmpty - Returns the array or a new array containing the provided default value if empty
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.defaultifempty(v=vs.110).aspx
 * @param {any} value The default vlaue
 * @return {Array}
 */
function DefaultIfEmpty (constructorOrValue) {
  if (!isEmpty(this)) {
    return this
  }

  return [getDefault(constructorOrValue)]
}




/* src/heap.js */

/**
 * HeapElement class that also provides the element index for sorting.
 */
let HeapElement = (function () {

    /**
     * Creates a new HeapElement.
     *
     * @param {number} index Element index.
     * @param {T}      value Element value.
     * @param {any}    <T>   Value type.
     */
    function HeapElement(index, value) {
        this.__index = index;
        this.__value = value;

        // for faster instance detection
        this.__isHeapElementInstance = true;
    }

    /**
     * Creates or returns a heap element from the given data.
     * If obj is a HeapElement obj is returned, creates a HeapElement otherwise.
     *
     * @param {number}           index Current element index.
     * @param {T|HeapElement<T>} obj   Element.
     * @param {any}              <T>   Value type.
     * @return {HeapElement<T>} Created heap element or obj if it already is a heap object.
     */
    HeapElement.CreateHeapElement = function CreateHeapElement(index, obj) {
        if (obj === undefined || obj.__isHeapElementInstance) {
            return obj;
        }
        return new HeapElement(index, obj);
    };

    return HeapElement;
})();

/*
 * Partially sorted heap that contains the smallest element within root position.
 */
let MinHeap = (function () {

    /**
     * Creates the heap from the array of elements with the given comparator function.
     *
     * @param {T[]}              elements   Array with elements to create the heap from.
     *                                      Will be modified in place for heap logic.
     * @param {(T, T) => number} comparator Comparator function (same as the one for Array.sort()).
     * @param {any}              <T>        Heap element type.
     */
    function MinHeap(elements, comparator = DefaultComparator) {
        __assertArray(elements);
        __assertFunction(comparator);

        // we do not wrap elements here since the heapify function does that the moment it encounters elements
        this.elements = elements;

        // create comparator that works on heap elements (it also ensures equal elements remain in original order)
        this.comparator = (a, b) => {
            let res = comparator(a.__value, b.__value);
            if (res !== 0) {
                return res;
            }
            return DefaultComparator(a.__index, b.__index);
        };

        // create heap ordering
        createHeap(this.elements, this.comparator);
    }

    /**
     * Places the element at the given position into the correct position within the heap.
     *
     * @param {T}                elements   Array with elements used for the heap.
     * @param {(T, T) => number} comparator Comparator function (same as the one for Array.sort()).
     * @param {number}           i          Index of the element that will be placed to the correct position.
     * @param {any}              <T>        Heap element type.
     */
    function heapify(elements, comparator, i) {
        let right     = 2 * (i + 1);
        let left      = right - 1;
        let bestIndex = i;

        // wrap elements the moment we encouter them first
        elements[bestIndex] = HeapElement.CreateHeapElement(bestIndex, elements[bestIndex]);

        // check if the element is currently misplaced
        if (left < elements.length) {
            elements[left] = HeapElement.CreateHeapElement(left, elements[left]);
            if (comparator(elements[left], elements[bestIndex]) < 0) {
                bestIndex = left;
            }
        }
        if (right < elements.length) {
            elements[right] = HeapElement.CreateHeapElement(right, elements[right]);
            if (comparator(elements[right], elements[bestIndex]) < 0) {
                bestIndex = right;
            }
        }

        // if the element is misplaced, swap elements and continue until we get the right position
        if (bestIndex !== i) {
            let tmp = elements[i];
            elements[i] = elements[bestIndex];
            elements[bestIndex] = tmp;

            // let misplaced elements "bubble up" to get heap properties
            heapify(elements, comparator, bestIndex);
        }
    }

    /**
     * Creates a heap from the given array using the given comparator.
     *
     * @param {T[]}              elements   Array with elements used for the heap.
     *                                      Will be modified in place for heap logic.
     * @param {(T, T) => number} comparator Comparator function (same as the one for Array.sort()).
     * @param {any}              <T>        Heap element type.
     */
    function createHeap(elements, comparator) {

        // sepecial case: empty array
        if (elements.length === 0) {

            // nothing to do here
            return;
        }

        for (let i = Math.floor(elements.length / 2); i >= 0; i--) {

            // do fancy stuff
            heapify(elements, comparator, i);
        }
    }

    /**
     * Checks if the heap contains at least one element.
     *
     * @return {boolean} If the heap contains elements or not.
     */
    MinHeap.prototype.hasTopElement = function () {
        return this.elements.length > 0;
    };

    /**
     * Gets and removes the top element from the heap.
     * This method performs a bit of reordering to keep heap properties.
     *
     * @param {any} <T> Heap element type.
     *
     * @return {T} Top element from heap.
     */
    MinHeap.prototype.getTopElement = function () {

        // special case: only one element left
        if (this.elements.length === 1) {
            return this.elements.pop().__value;
        }

        let topElement = this.elements[0];
        let tmp = this.elements.pop();
        this.elements[0] = tmp;

        // do fancy stuff
        heapify(this.elements, this.comparator, 0);

        return topElement.__value;
    };

    /**
     * Creates an iterator for this heap instance.
     *
     * @return {Iterator} Iterator for the heap.
     */
    MinHeap.prototype[Symbol.iterator] = function () {

        // keep matching heap instance
        let heap = this;
        return {
            next: function () {
                if (heap.hasTopElement()) {
                    return {
                        done:  false,
                        value: heap.getTopElement()
                    };
                }
                return {
                    done: true
                };
            }
        }
    };

    return MinHeap;
})();

/*
 * Partially sorted heap that contains the largest element within root position.
 */
let MaxHeap = (function () {

    /**
     * Creates the heap from the array of elements with the given comparator function.
     *
     * @param {T[]}               elements   Array with elements to create the heap from.
     *                                       Will be modified in place for heap logic.
     * @param {(T, T) => boolean} comparator Comparator function (same as the one for Array.sort()).
     * @param {any}               <T>        Heap element type.
     */
    function MaxHeap(elements, comparator = DefaultComparator) {
        __assertArray(elements);
        __assertFunction(comparator);

        // simply negate the result of the comparator function so we get reverse ordering within the heap
        MinHeap.apply(this, [elements, function (a, b) { return -1 * comparator(a, b); }]);
    }

    // inheritance stuff (we don't want to implement stuff twice)
    MaxHeap.prototype = Object.create(MinHeap.prototype);
    MaxHeap.prototype.constructor = MaxHeap;

    return MaxHeap;
})()




/* src/transformation.js */

  /**
   * Aggregate - applies a accumulator function to a sequence
   *
   * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.aggregate(v=vs.110).aspx
   * @param {Function} accumulator The accumulator function of the form (prev, current) => any
   * @return {any} the result of the accumulation
   *//**
   * Aggregate - applies a accumulator function to a sequence. Starts with seed.
   *
   * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.aggregate(v=vs.110).aspx
   * @param {any} seed The starting value of the accumulation
   * @param {Function} accumulator The accumulator function of the form (prev, current) => any
   * @return {any} the result of the accumulation
   *//**
   * Aggregate - applies a accumulator function to a sequence. Starts with seed and transforms the result using resultTransformFn.
   *
   * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.aggregate(v=vs.110).aspx
   * @param {any} seed The starting value of the accumulation
   * @param {Function} accumulator The accumulator function of the form (prev, current) => any
   * @param {Function} resultTransformFn A function to transform the result
   * @return {any} the result of the accumulation
   * @
   */
  function Aggregate (seedOrAccumulator, accumulator, resultTransformFn) {
    const values = this.ToArray()

    if (typeof seedOrAccumulator === 'function' && !accumulator && !resultTransformFn) {
      return aggregateCollection(values.slice(1, values.length), values.slice(0, 1)[0], seedOrAccumulator, elem => elem)
    } else if (typeof seedOrAccumulator !== 'function' && typeof accumulator === 'function' && !resultTransformFn) {
      return aggregateCollection(values, seedOrAccumulator, accumulator, elem => elem)
    } else {
      return aggregateCollection(values, seedOrAccumulator, accumulator, resultTransformFn)
    }
  }

  function Select (mapFn = x => x) {
    const _self = this

    return new Collection(function * () {
      _self.reset()

      for (let val of _self) {
        yield mapFn(val)
      }
    })
  }

  /**
   * Distinct - Returns the distinct elemens from a sequence using the default equality compare function
   *
   * https://msdn.microsoft.com/de-de/library/system.linq.enumerable.distinct(v=vs.110).aspx
   * @return {Array}
   *//**
   * Distinct - Returns the distinct elemens from a sequence using a provided equality compare function
   *
   * https://msdn.microsoft.com/de-de/library/system.linq.enumerable.distinct(v=vs.110).aspx
   * @param {Function} equalityCompareFn The function of the form (first, second) => boolean determining if the values are equal
   * @return {Array}
   */
  function Distinct (equalityCompareFn = defaultEqualityCompareFn) {
    __assertFunction(equalityCompareFn)

    return removeDuplicates(this, equalityCompareFn)
  }

  function ToArray () {
    const result = [...this]
    this.reset()

    return result
  }

  /**
   * ToDictionary - description
   *
   * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.todictionary(v=vs.110).aspx
   * @param  {Function} keySelector                  Function to get the keys from the elements
   * @param  {Function} elementSelectorOrKeyComparer Function to either get the elements or compare the keys
   * @param  {Function} keyComparer                  Function to compare the keys
   * @return {Map}                                   A dictionary (Map)
   */
  function ToDictionary (keySelector, elementSelectorOrKeyComparer, keyComparer) {
    __assertFunction(keySelector)

    if (!elementSelectorOrKeyComparer && !keyComparer) {
      // ToDictionary(keySelector)
      return this.ToDictionary(keySelector, elem => elem, defaultEqualityCompareFn)
    } else if (!keyComparer && getParameterCount(elementSelectorOrKeyComparer) === 1) {
      // ToDictionary(keySelector, elementSelector)
      return this.ToDictionary(keySelector, elementSelectorOrKeyComparer, defaultEqualityCompareFn)
    } else if (!keyComparer && getParameterCount(elementSelectorOrKeyComparer) === 2) {
      // ToDictionary(keySelector, keyComparer)
      return this.ToDictionary(keySelector, elem => elem, elementSelectorOrKeyComparer)
    }

    // ToDictionary(keySelector, elementSelector, keyComparer)

    __assertFunction(keyComparer)
    __assertFunction(elementSelectorOrKeyComparer)

    let usedKeys = []
    let result = new Map()
    const input = this.ToArray()
    const elementSelector = elementSelectorOrKeyComparer

    for (let value of input) {
      let key = keySelector(value)
      let elem = elementSelector(value)

      __assert(key != null, 'Key is not allowed to be null!')
      __assert(!usedKeys.Any(x => keyComparer(x, key)), `Key '${key}' is already in use!`)

      usedKeys.push(key)
      result.set(key, elem)
    }

    return result
  }

  /*
GroupBy(keySelector)

GroupBy(keySelector, keyComparer)
GroupBy(keySelector, elementSelector)
GroupBy(keySelector, resultTransformFn)

GroupBy(keySelector, resultTransformFn, keyComparer)
GroupBy(keySelector, elementSelector, keyComparer)
GroupBy(keySelector, elementSelector, resultTransformFn)

GroupBy(keySelector, elementSelector, resultTransformFn, keyComparer)
  */
  function GroupBy (keySelector, keyComparerOrResultTransformFnOrElementSelector, keyComparerOrResultTransformFn, keyComparer) {
    __assertFunction(keySelector)


  }




/* src/insert-and-remove.js */

/**
 * Add - Adds an element to the end of the array
 *
 * @see https://msdn.microsoft.com/de-de/library/3wcytfd1(v=vs.110).aspx
 * @param  {any}         value The value to add
 * @return {void}
 */
function Add (value) {
  this.Insert(value, this.Count())
}

/**
 * Insert - Adds an element to the specified index of the collection
 *
 * @see https://msdn.microsoft.com/de-de/library/sey5k5z4(v=vs.110).aspx
 * @param  {any}         value The value to add
 * @param  {Number}      index The index to add the value to
 * @return {void}
 */
function Insert (value, index) {
  __assert(index >= 0 && index <= this.Count(), 'Index is out of bounds!')

  const oldIter = this.ToArray()

  this.iterable = function * () {
    yield* oldIter.slice(0, index)
    yield value
    yield* oldIter.slice(index, oldIter.length)
  }
  this.reset()
}

/**
 * Remove - Removes an element from an array
 *
 * @param  {any} value The value to remove
 * @return {Boolean}       True if the element was removed, false if not (or the element was not found)
 */
function Remove (value) {
  let values = this.ToArray()
  const result = removeFromArray(values, value)

  if (!result) {
    return false
  }

  this.iterable = function * () {
    yield* values
  }
  this.reset()

  return true
}




/* src/order.js */

// TODO: change implementation to use iterators!

function Order() {
    return this.OrderBy(DefaultComparator);
}

function OrderCompare() {
    return this.sort(DefaultComparator);
}

function OrderBy(comparator) {
    __assertFunction(comparator);
    let heap = new MinHeap(this, comparator);
    return [...heap];
}

function OrderDescending() {
    return this.OrderByDescending(DefaultComparator);
}

function OrderByDescending(comparator) {
    __assertFunction(comparator);
    let heap = new MaxHeap(this, comparator);
    return [...heap];
}




/* src/ordered-collection.js */

/*
 * Ordered linq collection.
 */
let OrderedLinqCollection = (function () {

    /**
     * Creates a new ordered linq collection using the given comparator and heap for sorting.
     *
     * @param {Iterable<T>}       iterable        Datasource for this collection.
     * @param {(T, T) => boolean} comparator      Comparator for sorting.
     * @param {MinHeap|MaxHeap}   heapConstructor Heap implementation for sorting.
     * @param {any}               <T>             Element type.
     */
    function OrderedLinqCollection(iterable, comparator, heapConstructor) {
        __assertIterable(iterable);
        __assertFunction(comparator);
        __assertFunction(heapConstructor);
        Collection.apply(this, [iterable]);

        this.__comparator      = comparator;
        this.__heapConstructor = heapConstructor;
    }

    /**
     * Specifies further sorting by the given comparator for equal elements.
     *
     * @param {(T, T) => boolean} additionalComparator Comparator for sorting.
     * @param {any}               <T>                  Element type.
     * @return {OrderedLinqCollection<T>} Created ordered linq collection.
     */
    OrderedLinqCollection.prototype.ThenBy = function ThenBy(additionalComparator) {
        __assertIterationNotStarted(this);
        if (isString(additionalComparator)) {
            additionalComparator = GetComparatorFromKeySelector(additionalComparator);
        }
        __assertFunction(additionalComparator);

        // build new comparator function when not yet iterated
        let currentComparator = this.__comparator;
        this.__comparator = (a, b) => {
            let res = currentComparator(a, b);
            if (res !== 0) {
                return res;
            }
            return additionalComparator(a, b);
        };
        return this;
    };

    OrderedLinqCollection.prototype[getIterator] = function () {
      const _self = this

      return function * () {
        yield* Reflect.construct(_self.__heapConstructor, [[..._self.iterable], _self.__comparator])
      }()
    }

    return OrderedLinqCollection;
})();

/**
 * Creates a comparator function from the given selector string.
 * The selector string has to be in same format as within javascript code.
 *
 * @param  {string} selector Javascript code selector string.
 * @return {(any, any) => boolean} Created comparator function.
 */
function GetComparatorFromKeySelector(selector) {
    __assertString(selector);
    if (selector === '') {
        return Collection.prototype.DefaultComparator;
    }
    if (!(selector.startsWith('[') || selector.startsWith('.'))) {
        selector = `.${selector}`;
    }
    let result;
    eval(`result = function (a, b) { return Collection.prototype.DefaultComparator(a${selector}, b${selector}) }`);
    return result;
}

/**
 * Orderes this linq collection using the given comparator.
 *
 * @param {(T, T) => boolean} comparator Comparator to be used.
 * @param {any}               <T>        Element type.
 * @return {OrderedLinqCollection<T>} Ordered collection.
 */
function OrderBy (comparator) {
    if (isString(comparator)) {
        comparator = GetComparatorFromKeySelector(comparator);
    }
    __assertFunction(comparator);
    return new OrderedLinqCollection(this.ToArray(), comparator, MinHeap);
};

/**
 * Orderes this linq collection in descending order using the given comparator.
 *
 * @param {(T, T) => boolean} comparator Comparator to be used.
 * @param {any}               <T>        Element type.
 * @return {OrderedLinqCollection<T>} Ordered collection.
 */
function OrderByDescending (comparator) {
    if (isString(comparator)) {
        comparator = GetComparatorFromKeySelector(comparator);
    }
    __assertFunction(comparator);
    return new OrderedLinqCollection(this.ToArray(), comparator, MaxHeap);
};


  /* Export public interface */
  __export({ DefaultComparator, install, Min, Max, Average, Sum, Concat, Union, Join, Where, Count, Any, All, ElementAt, Take, TakeWhile, Skip, SkipWhile, Contains, First, FirstOrDefault, Last, LastOrDefault, Single, SingleOrDefault, DefaultIfEmpty, DefaultComparator, MinHeap, MaxHeap, Aggregate, Distinct, Select, ToArray, ToDictionary, Add, Insert, Remove, Order, OrderCompare, OrderBy, OrderDescending, OrderByDescending, GetComparatorFromKeySelector, OrderedLinqCollection, OrderBy, OrderByDescending })
}))
}())
