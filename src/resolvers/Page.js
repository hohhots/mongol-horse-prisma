function postedBy(parent, args, context) {
  return context.prisma.page({ id: parent.id }).postedBy();
}

function book(parent, args, context) {
  return context.prisma.page({ id: parent.id }).book();
}

module.exports = {
  postedBy,
  book,
};
