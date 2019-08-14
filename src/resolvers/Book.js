function postedBy(parent, args, context) {
  return context.prisma.book({ id: parent.id }).postedBy();
}

function pages(parent, args, context) {
  return context.prisma.book({ id: parent.id }).pages();
}

module.exports = {
  postedBy,
  pages,
};
