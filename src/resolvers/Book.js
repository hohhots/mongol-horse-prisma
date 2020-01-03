function postedBy(parent, args, context) {
  return context.prisma.book({ id: parent.id }).postedBy();
}

function pages(parent, args, context, info) {
  return context.prisma.book({ id: parent.id }).pages({
    where: { content_contains: info.variableValues.filter },
    orderBy: 'pageNum_ASC',
  });
}

module.exports = {
  postedBy,
  pages,
};
