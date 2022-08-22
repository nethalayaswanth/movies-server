function paginateResults({ results, size = 8, after }) {
  if (size < 1) return [];
  if (!after) results.slice(0, size);

  const cursorIndex = results.findIndex((item) => {
    let itemCursor = item.id ? item.id : 0;

    return itemCursor ? after === itemCursor : false;
  });
const data =
  cursorIndex >= 0
    ? cursorIndex === results.length - 1
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + size)
        )
    : results.slice(0, size);

    const cursor=data.length ? data[data.length - 1].id : null;
    const  hasMore=data.length
            ? data[data.length - 1].id !== results[results.length - 1].id
            : false;
  return {
    data,
    cursor,
    hasMore
  }
}


module.exports.paginateResults = paginateResults;