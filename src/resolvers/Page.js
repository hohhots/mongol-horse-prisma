const { getFileType } = require('../utils');

function postedBy(parent, args, context) {
  return context.prisma.page({ id: parent.id }).postedBy();
}

function book(parent, args, context) {
  return context.prisma.page({ id: parent.id }).book();
}

function imageType(parent, args, context) {
  return context.prisma
    .page({ id: parent.id })
    .book()
    .id()
    .then((data) => {
      return getFileType(data, parent.id);
    });
}

module.exports = {
  postedBy,
  book,
  imageType,
};
