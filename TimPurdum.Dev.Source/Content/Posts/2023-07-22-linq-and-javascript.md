---
layout: post
title: "LINQ Equivalents in JavaScript"
subtitle: "Move Seamlessly Between Languages"
---

[Originally posted on the dymaptic blog on June 16, 2023](https://blog.dymaptic.com/c-linq-equivalents-in-javascript)


When I'm working on [GeoBlazor](www.geoblazor.com) or other Blazor applications, I often have to switch between C# and JavaScript/TypeScript. While the two languages have a _lot_ in common (C family syntax, async/await, lambda functions), one place I often get confused is when dealing with arrays or collections of items. In C#, the most straightforward way to do this is with [`LINQ` queries](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable). Most of these query methods work on any collection type, including `Array`, `List`, `ReadOnlyList`, `HashSet`, and the related interfaces. The root interface necessary is `IEnumerable`.

With ES6 and later versions, JavaScript has adopted many of these same approaches as [methods on the `Array` class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), using `Array.prototype` ([prototype is the JavaScript concept of inheritance](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes)).

![C# LINQ to JavaScript Equivalents](/images/C-Sharp-LINQ.jpg)

In this post, I am going to discuss all of the methods of `IEnumerable` in `LINQ` and their JavaScript equivalents. Some of these methods are very common, while others, such as the [new .NET 6 `...By` methods](https://exceptionnotfound.net/bite-size-dotnet-6-unionby-intersectby-exceptby-and-distinctby/), are less well known. I'm also not going to deal with every possible parameter overload, as many LINQ methods allow for custom `IComparer` implementations or other optional parameters. In most cases, you will see that JavaScript has fewer methods than C#, but that they can be used in many of the same ways. It is also important to note that all `IEnumerable` methods return a _new_ collection, and do not modify the original input collection. C# does have mutable collection methods, for example on the `List` class, such as `Add`, `Remove`, `Sort`, but these are kept distinct from the LINQ methods to make it clearer when you are mutating the original value. In JavaScript, both mutating and functional methods exist on `Array.prototype`. In fact, there is a recent collection of new methods that _only_ return a new array, such as `toSorted`, `toReversed`, and `toSpliced`, but these are [not yet implemented in all major browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced#browser_compatibility) at the time of writing. In the comparison chart, I do use several mutating array methods, but only because there is no functional equivalent in JavaScript to compare to LINQ. 

If you want to skip to the comparison table to look up a method, <a href="#comparison-chart">jump to the end of this post</a>.

## Creating a new Collection

In both languages, you can easily create a new collection. `new List<T>()` in C#, or `[]` in JavaScript, for example. C# also has the following convenience static methods on `IEnumerable` to generate a new collection.

### C#
- `Empty` - Creates a new, empty `IEnumerable` instance.
- `Range` - Creates a new collection of sequential intervals, with a given start index and count.
- `Repeat` - Generates a new collection with the same item repeated a given `Count` times.

## Finding a Single Record

### C#
- `ElementAt` - Finds the element at a particular index. Similar to using an indexer (e.g., `array[index]`). Throws if the index is out of range.
- `ElementAtOrDefault` - Like `ElementAt` but returns `default` (`null` for nullable types) if the index is out of range.
- `First` - Finds the first item that matches the predicate. Throws on no match.
- `FirstOrDefault` - Like `First` but returns `default` if no match is found.
- `Last` - Finds the _last_ item that matches the predicate. Throws on no match.
- `LastOrDefault` - Like `Last` but returns `default` if no match is found.
- `Max` - Returns the item with the highest numeric value.
- `MaxBy` - Returns the item with the highest `Key` value according to the given `IComparer`.
- `Min` - Returns the item with the lowest numeric value.
- `MinBy` - Returns the item with the lowest `Key` value according to the given `IComparer`.
- `Single` - Like `First` but also throws if multiple matches are found.
- `SingleOrDefault` Like `FirstOrDefault` but also throws if multiple matches are found.

As you can see, each method comes in two flavors, `null`-forgiving, and `null`-throwing. Like [Nullable Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references), this is useful for explicitly declaring your intentions, and not accidentally returning a `null` where you really expected there to be a value. The `Single` methods also verify that you have exactly one match in your collection.

### JavaScript
- `at` - Finds the element at a particular index.
- `find` - Finds the first element that matches the predicate.
- `findLast` - Finds the _last_ element that matches the predicate.

In JavaScript, we have fewer methods that return a single value. Unlike in C#, JavaScript never throws errors if it fails to find an item. Instead, all of these methods return an `undefined` value if a match is not found. There is also no equivalent of `Single` in JavaScript. Instead, you would have to `filter` and then `throw` if you found more than one match.

## Finding or Filtering Multiple Records
 
### C#
- `Distinct` - Removes any duplicate entries and returns a collection in which each entry is unique.
- `DistinctBy` - Removes entries with duplicate `Key` values.
- `Except` - Returns all items from the first collection that are _not_ in the second collection.
- `ExceptBy` - Returns all items from the first collection that do _not_ have a matching `Key` value in the second collection.
- `Intersect` - Compares two collections and returns all items that are present in both.
- `IntersectBy` - Compares two collections and returns all items that have matching `Key` values in both.
- `OfType<T>` - Filters the collection to only records of a particular `Type`.
- `Skip` - Skips a specified number of records, and then returns the rest of the collection.
- `SkipLast` - Returns the collection minus the specified number of records at the end.
- `SkipWhile` - Skips forward over the collection until the predicate is `false`, and then returns the rest of the collection.
- `Take` - Returns the first specified number of elements in the collection.
- `TakeLast` - Returns the specified number of elements from the end of the collection.
- `TakeWhile` - Returns all elements from the start of the collection until the predicate is `false`.
- `Where` - Finds all matches to the predicate. If none found, returns an empty IEnumerable.

### JavaScript
- `filter` - Finds all matches to the predicate. If none found, returns an empty array.
- `slice` - Returns a sub-section of the collection by start index and optional end index.

Once again, C# has multipe methods that can filter a collection, whereas JavaScript has just the one. Yet you can easily `filter` on class type or the contents of a second array.

## Sorting Records

### C#
- `Order` - Sorts the items by their default comparison in ascending order.
- `OrderBy` - Sorts the items by a `Key` value in ascending order.
- `OrderByDescending` - Sorts the items by a `Key` value in descending order.
- `OrderDescending` - Sorts the items by their default comparison in descending order.
- `Reverse` - Returns a collection in the opposite order from the original.
- `ThenBy` - Used to chain sorting calls with any `Order`, `OrderBy` or other `ThenBy` call. Sorts by a new `Key` ascending.
- `ThenByDescending` - Used to chain sorting calls with any `Order`, `OrderBy` or other `ThenBy` call. Sorts by a new `Key` descending.

### JavaScript
- `sort` - Sorts the items by their default order or a comparison function. Mutates the original array.
- `reverse` - Returns the array in the opposite order from the original. Mutates the original array.

## Combining or Adding to Collections

### C#
- `Append` - Adds a new item to the end of the collection.
- `Concat` - Adds a new collection to the end of the first collection.
- `Join` - Combines two collections, based on a defined `Key` in each, and a custom function to join the two together.
- `Prepend` - Adds a new item to the beginning of the collection.
- `Union` - Combines two collections, excluding duplicates.
- `UnionBy` - Combines two collections, limiting each `Key` to a single instance.

### JavaScript
- `concat` - Adds a new array to the end of the first array. Does not alter the existing arrays.
- `push` - Adds a new item to the end of the array, and returns the new `length`.
- `unshift` - Adds a new item to the beginning of the array, and returns the new `length`.

## Boolean Methods

These methods return a `true` or `false` depending on what is in the collection.

### C#
- `All` - Returns `true` if all items match the predicate.
- `Any` - Returns `true` if any item matches the predicate.
- `Contains` - Returns `true` if the item is in the collection.
- `SequenceEqual` - Compares each item in two collections, and returns `true` if they all match.

### JavaScript
- `every` - Returns `true` if all items match the predicate.
- `includes` - Returns `true` if the item is in the array.
- `some` - Returns `true` if any item matches the predicate.

## Counting and Transforming Items

There are many transformations possible on a collection of items, especially on numeric types. These methods can be very powerful, and are in my opinion the hardest to keep straight in terms of different names. For example, `Aggregate`, and `reduce` seem like opposite terms, yet they are actually the same concept! `Select` and `map` are probably the most common transformation in each language, so it is important to know how to use them well.

### C#
- `Aggregate` - Applies an `Accumulator` function to the collection, where each item and the accumulation are passed as parameters. Also supports giving a starting `seed` value.
- `Average` - Finds the numeric average of the collection values.
- `Count` - Returns the number of collection items as an `int`.
- `LongCount` - Returns the number of collection items as a `long`.
- `Select` - Transforms each item in the collection via a custom function into a new value.
- `SelectMany` - Transforms each item in the collection into a new _collection_ of values, which are then flattened into a single new collection.
- `Sum` - Adds all the values together for the collection.
- `TryGetNonEnumeratedCount` - Attempts to count the items in the collection without actually enumerating the items. Returns a boolean to indicate success, and has an `out` parameter with the count value.
- `Zip` - Uses a custom function to combine each item in two collections together by index.

### JavaScript
- `flatMap` - Transforms each item in the collection into a new _array_ of values, which are then flattened into a single array.
- `length` - Returns the number of items in the array.
- `map` - Transforms each item in the array via a custom function into a new value.
- `reduce` - Applies an `accumulator` function to the array, where each item and the accumulation are passed as parameters. Also supports an `initialValue`.

## C#-Only Type Transformations

These methods do not have a JavaScript equivalent because JS is a loosely-typed language. Instead, you can simply _treat_ one type like another, and if it has the correct properties and methods, it will work. In C#, not only do you need to cast to the appropriate collection type for some usages, but since many LINQ methods use [deferred execution](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/classification-of-standard-query-operators-by-manner-of-execution#deferred), this also forces the query to actually run and produce an in-memory collection.

- `AsEnumerable` - Returns the collection as an `IEnumerable<T>`.
- `Cast<T>` - Returns the collection with each item cast to the `T` value in an `IEnumerable<T>`.
- `DefaultIfEmpty` - Returns the original collection, or if the collection was empty, returns a new collection with a single, default value (e.g., `null`).
- `ToArray` - Returns a fixed-length array.
- `ToDictionary` - Transforms a simple collection into a Key/Value pair Dictionary.
- `ToHashSet` - Returns a collection with no duplicates, similar to `Distinct`, but the `HashSet` type prevents adding duplicates in the future as well.
- `ToList` - Returns a mutable list that can be added to or removed from.
- `ToLookup` - Groups the collection under `key` lookup values.

## C#-Only Grouping Records
- `Chunk` - Creates a collection of arrays, of a fixed maximum size, from the original collection.
- `GroupBy` - Creates a collection of `IGrouping` elements, each of which is a collection of items from the original collection grouped by a predicate.
- `GroupJoin` - Creates a new collection, normally with a different `Type`, that contains the joined results of two collections.

<h2 id="comparison-chart">Comparison Chart</h2>

In the following chart, I aimed for a 1-1 comparison whenever possible. If there was no JavaScript Array method, I tried to find the most succinct way of achieving the same result in code.

| C# LINQ `IEnumerable` Method                               | JavaScript `Array.prototype` Method                          |
|------------------------------------------------------------|--------------------------------------------------------------|
| `Aggregate((acc, x) => function, seed)`                    | `reduce((acc, x) => function, seed)`                         |
| `All(x => predicate)`                                      | `every(x => predicate)`                                      |
| `Any(x => predicate)`                                      | `some(x => predicate)`                                       |
| `Append(item)`                                             | `push(item)`                                                 |
| `AsEnumerable()`                                           | N/A                                                          |
| `Average()`                                                | `reduce((acc, x) => acc + x) / array.length`                 |
| `Cast<T>()`                                                | N/A                                                          |
| `Chunk(size)`                                              | no simple equivalent                                         |
| `Concat(otherIEnumerable)`                                 | `concat(otherArray)`                                         |
| `Contains(item)`                                           | `includes(item)`                                             |
| `Count()`                                                  | `length`                                                     |
| `DefaultIfEmpty()`                                         | `some() ? array : undefined`                                 |
| `Distinct()`                                               | `[...new Set(array)]` <sup>2</sup>                           |
| `DistinctBy(x => x.Key)`                                   | no simple equivalent                                         |
| `ElementAt(index)`                                         | `at(index)`                                                  |
| `ElementAtOrDefault(index)`                                | `at(index)`                                                  |
| `Empty<T>()` <sup>1</sup>                                  | `[]` <sup>2</sup>                                            |
| `Except(otherIEnumerable)`                                 | `filter(x => !otherArray.includes(x))`                       |
| `ExceptBy(other, x => x.Key)`                              | no simple equivalent                                         |
| `First(x => predicate)`                                    | `find(x => predicate)`                                       |
| `FirstOrDefault(x => predicate)`                           | `find(x => predicate)`                                       |
| `GroupBy(x => predicate)`                                  | no simple equivalent <sup>3</sup>                            |
| `GroupJoin(inner, o => o.Key, i => i.Key, func, comparer)` | no simple equivalent                                         |
| `Intersect(other)`                                         | `filter(x => otherArray.includes(x))`                        |
| `IntersectBy(other, x => x.Key, comparer)`                 | no simple equivalent                                         |
| `Join(inner, o => o.Key, i => i.Key, func)`                | no simple equivalent                                         |
| `Last(x => predicate)`                                     | `findLast(x => predicate)`                                   |
| `LastOrDefault(x => predicate)`                            | `findLast(x => predicate)`                                   |
| `LongCount()`                                              | `length`                                                     |
| `Max()`                                                    | `Math.max(...array)` <sup>2</sup>                            |
| `MaxBy(x => x.Key)`                                        | `sort((a, b) => b.Key - a.Key)[0]`                           |
| `Min()`                                                    | `Math.min(...array)` <sup>2</sup>                            |
| `MinBy(x => x.Key)`                                        | `sort((a, b) => a.Key - b.Key)[0]`                           |
| `OfType<T>()`                                              | `filter(x => x instanceof T)`                                |
| `Order()`                                                  | `sort()` <sup>4</sup>                                        |
| `OrderBy(x => x.Key)`                                      | `sort((a, b) => a.key - b.key)` <sup>4</sup>                 |
| `OrderByDescending(x => x.Key)`                            | `sort((a, b) => b.key - a.key)` <sup>4</sup>                 |
| `OrderDescending()`                                        | `sort((a, b) => b - a)` <sup>4</sup>                         |
| `Prepend(item)`                                            | `unshift(item)` <sup>4</sup>                                 |
| `Range(start, count)` <sup>1</sup>                         | `[...Array(count + start).keys()].slice(start)` <sup>2</sup> |
| `Repeat(item, count)` <sup>1</sup>                         | `fill(item, startIndex, endIndex)` <sup>4</sup>              |
| `Reverse()`                                                | `reverse()` <sup>4</sup>                                     |
| `Select(x => function)`                                    | `map(x => function)`                                         |
| `SelectMany(x => function)`                                | `flatMap(x => function)`                                     |
| `SequenceEqual(otherIEnumerable)`                          | no simple equivalent                                         |
| `Single(x => predicate)`                                   | `filter(x => predicate); result.length > 1 ? throw error;`   |
| `SingleOrDefault(x => predicate)`                          | `filter(x => predicate); result.length > 1 ? throw error;`   |
| `Skip(count)`                                              | `slice(count)`                                               |
| `SkipLast(count)`                                          | `slice(0, -count)`                                           |
| `SkipWhile(x => predicate)`                                | no simple equivalent                                         |
| `Sum()`                                                    | `reduce((acc, x) => acc + x)`                                |
| `Take(count)`                                              | `slice(0, count)`                                            |
| `TakeLast(count)`                                          | `slice(-count)`                                              |
| `TakeWhile(x => predicate)`                                | no simple equivalent                                         |
| `ThenBy(x => x.Key)`                                       | no simple equivalent                                         |
| `ThenByDescending(x => x.Key)`                             | no simple equivalent                                         |
| `ToArray()`                                                | N/A                                                          |
| `ToDictionary(x => function, x => function)`               | `reduce((acc, x, i) => acc[functionK] = functionV)`          |
| `ToHashSet()`                                              | `new Set(array)` <sup>2</sup>                                |
| `ToList()`                                                 | N/A                                                          |
| `ToLookup(x => function, x => function)`                   | no simple equivalent                                         |
| `TryGetNonEnumerated(out int count)`                       | no simple equivalent                                         |
| `Where(x => predicate)`                                    | `filter(x => predicate)`                                     |
| `Union(otherIEnumerable)`                                  | `[...new Set(array.concat(otherArray))]`                     |
| `UnionBy(other, x => x.Key)`                               | no simple equivalent                                         |
| `Zip(other, (a, b) => function)`                           | `map((a, i) => functionWithOther[i])`                        |

<sup>1</sup> - _static method on `Enumerable`_<br/>
<sup>2</sup> - _not a method on `Array.prototype`_<br/>
<sup>3</sup> - _`group` method is in experimental stage_<br/>
<sup>4</sup> - _mutates the original array_<br/>

## Conclusion

I hope this deep dive into LINQ functional methods and their JavaScript Array counterparts was useful. If you are a .NET Blazor developer or interested in GeoSpatial Information Systems (GIS), checkout [GeoBlazor](https://geoblazor.com) and the [dymaptic blog](https://blog.dymaptic.com) for more content!