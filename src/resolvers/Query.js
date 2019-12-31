async function page(parent, args, context) {
  return await context.prisma.page({ id: args.pageId });
}

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

module.exports = {
  page,
  book,
  bookList,
};
