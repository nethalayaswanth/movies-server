function paginateResults({ response, size = 8, after }) {
  if (size < 1) return [];
  const {results,nextPage,page}=response
  if (!after) results.slice(0, size);
  if (results.length === 0) return {
    data: [],
    cursor: null,
    hasMore: false,
    page:0,
    nextPage: null,
  };
  const cursorIndex = results.findIndex((item) => {
    let itemCursor = item.id ?? 0;

    return after === itemCursor;
  });
 
  const data =
    cursorIndex >= 0
      ? cursorIndex === results.length - 1
        ? [] 
        : results.slice( 
            cursorIndex + 1,
          Math.min(results.length, cursorIndex + size +1)
          )
      : results.slice(0, size);
 
  const cursor = data.length ? data[data.length - 1].id : null;
  const hasMore = data.length 
    ? data[data.length - 1].id !== results[results.length - 1].id
    : false;

    
  return {
    data,
    cursor,
    hasMore,
    nextPage,
    page,
  };
}

module.exports.paginateResults = paginateResults;
