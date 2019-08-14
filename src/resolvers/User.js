function books(parent, args, context) {
  return context.prisma.user({ id: parent.id }).books();
}

function pages(parent, args, context) {
  return context.prisma.user({ id: parent.id }).pages();
}

module.exports = {
  books,
  pages,
};
