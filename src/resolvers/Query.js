async function book(parent, args, context) {
  return await context.prisma.book({ id: args.bookId });
}

async function bookList(parent, args, context) {
  const where = args.filter
    ? {
        OR: [
          { title_contains: args.filter },
          { preview_contains: args.filter },
        ],
      }
    : {};

  const books = await context.prisma.books({
    where,
    skip: args.skip,
    first: args.first,
    orderBy: args.orderBy,
  });
  const count = await context.prisma
    .booksConnection({
      where,
    })
    .aggregate()
    .count();
  return {
    books,
    count,
  };
}

async function pageList(parent, args, context) {
  const where = args.filter
    ? {
        content_contains: args.filter,
      }
    : {};

  const pages = await context.prisma.pages({
    where,
    skip: args.skip,
    first: args.first,
    orderBy: args.orderBy,
  });
  const count = await context.prisma
    .pagesConnection({
      where,
    })
    .aggregate()
    .count();
  return {
    pages,
    count,
  };
}

module.exports = {
  book,
  bookList,
  pageList,
};