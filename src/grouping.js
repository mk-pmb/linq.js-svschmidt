/**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @return {Map} The grouped sequence as a Map
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector. The keys are compared using keyComparer.
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} keyComparer A function of the form (first, second) => bool to check if keys are considered equal
 * @return {Map} The grouped sequence as a Map
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector.
 * Each group member is projected to a single value (e.g. a property) using the elementSelector.
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} elementSelector A function to map each group member to a specific value
 * @return {Map} The grouped sequence as a Map
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector.
 * The resultSelector is used to project each resulting group to a single value (e.g. an object with aggregated properties).
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} resultSelector A function of the form (key, groupMembers) => any to select a final result from each group
 * @return {Collection} The grouped sequence with projected results as a new Collection
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector. Keys are compared using the specified keyComparer.
 * Each group member is projected to a single value (e.g. a property) using the elementSelector.
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} elementSelector A function to map each group member to a specific value
 * @param {Function} keyComparer A function of the form (first, second) => bool to check if keys are considered equal
 * @return {Map} The grouped sequence as a Map
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector. Keys are compared using the specified keyComparer.
 * Each group member is projected to a single value (e.g. a property) using the elementSelector.
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} elementSelector A function to map each group member to a specific value
 * @param {Function} keyComparer A function of the form (first, second) => bool to check if keys are considered equal
 * @return {Map} The grouped sequence as a Map
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector.
 * Each group member is projected to a single value (e.g. a property) using the elementSelector.
 * The resultSelector is used to project each resulting group to a single value (e.g. an object with aggregated properties).
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} elementSelector A function to map each group member to a specific value
 * @param {Function} resultSelector A function of the form (key, groupMembers) => any to select a final result from each group
 * @return {Collection} The grouped sequence with projected results as a new Collection
 *//**
 * GroupBy - Groups a sequence using the keys selected from the members using the keySelector. The keys are compared using the keyComparer.
 * Each group member is projected to a single value (e.g. a property) using the elementSelector.
 * The resultSelector is used to project each resulting group to a single value (e.g. an object with aggregated properties).
 *
 * @see https://msdn.microsoft.com/de-de/library/system.linq.enumerable.groupby(v=vs.110).aspx
 * @instance
 * @memberof Collection
 * @method
 * @param {Function} keySelector A function to select grouping keys from the sequence members
 * @param {Function} elementSelector A function to map each group member to a specific value
 * @param {Function} resultSelector A function of the form (key, groupMembers) => any to select a final result from each group
 * @param {Function} keyComparer A function of the form (first, second) => bool to check if keys are considered equal
 * @return {Collection} The grouped sequence with projected results as a new Collection
 * @
 */
function GroupBy (keySelector, ...args) {
  __assertFunction(keySelector)

  const arr = this.ToArray()

  function isKeyComparer (arg) {
    let result = getParameterCount(arg) === 2
    try {
      result = result && arg(1, 1) && !arg(1, 2)
    } catch (err) {
      result = false
    }

    return result
  }

  function getKey(groups, key, keyComparer) {
    for (let groupKey of groups.keys()) {
      if (keyComparer(groupKey, key)) {
        return groupKey
      }
    }

    return key
  }

  /*
  GroupBy(keySelector)
  */
  function groupByOneArgument (keySelector) {
    return groupBy(keySelector, elem => elem, undefined, defaultEqualityCompareFn)
  }

  /*
  GroupBy(keySelector, keyComparer)
  GroupBy(keySelector, elementSelector)
  GroupBy(keySelector, resultSelector)
  */
  function groupByTwoArguments (keySelector, second) {
    let keyComparer, elementSelector

    if (isKeyComparer(second)) {
      keyComparer = second
      elementSelector = elem => elem
    } else {
      keyComparer = defaultEqualityCompareFn
      elementSelector = second
    }

    return groupByThreeArguments(keySelector, elementSelector, keyComparer)
  }

  /*
  GroupBy(keySelector, resultSelector, keyComparer)
  GroupBy(keySelector, elementSelector, keyComparer)
  GroupBy(keySelector, elementSelector, resultSelector)
  */
  function groupByThreeArguments (keySelector, second, third) {
    let keyComparer, elementSelector, resultSelector

    if (isKeyComparer(third)) {
      keyComparer = third
    } else {
      resultSelector = third
    }

    if (getParameterCount(second) === 2) {
      resultSelector = second
    } else {
      elementSelector = second
    }

    if (!keyComparer) {
      keyComparer = defaultEqualityCompareFn
    }

    if (!elementSelector) {
      elementSelector = elem => elem
    }

    return groupBy(keySelector, elementSelector, resultSelector, keyComparer)
  }

  function groupBy (keySelector, elementSelector, resultSelector, keyComparer) {
    let groups = new Map()
    let result

    for (let val of arr) {
      const key = getKey(groups, keySelector(val), keyComparer)
      const elem = elementSelector(val)

      if (groups.has(key)) {
        groups.get(key).push(elem)
      } else {
        groups.set(key, [elem])
      }
    }

    if (resultSelector) {
      result = groups.ToArray().Select(g => resultSelector(...g))
    } else {
      result = groups
    }

    return result
  }

  switch (args.length) {
    case 0:
      return groupByOneArgument(keySelector)
      break
    case 1:
      return groupByTwoArguments(keySelector, ...args)
      break
    case 2:
      return groupByThreeArguments(keySelector, ...args)
      break
    case 3:
      return groupBy(keySelector, ...args)
      break
    default:
      throw new Error('GroupBy parameter count can not be greater than 4!')
      break
  }
}

__export({ GroupBy })