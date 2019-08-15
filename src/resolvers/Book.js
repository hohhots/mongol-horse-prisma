function postedBy(parent, args, context) {
  return context.prisma.book({ id: parent.id }).postedBy();
}

function pages(parent, args, context) {
  return context.prisma
    .book({ id: parent.id })
    .pages({ orderBy: 'pageNum_ASC' });
}

module.exports = {
  postedBy,
  pages,
};
