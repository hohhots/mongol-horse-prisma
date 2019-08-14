const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

function newBook(_, args, context) {
  const userId = getUserId(context);
  return context.prisma.createBook({
    title: args.title,
    author: args.author,
    publishedAt: args.publishedAt,
    preview: args.preview,
    postedBy: { connect: { id: userId } },
  });
}

function updateBook(_, args, context) {
  getUserId(context);
  const where = {
    id: args.bookId,
  };
  return context.prisma.updateBook({
    data: {
      title: args.title,
      author: args.author,
      publishedAt: args.publishedAt,
      preview: args.preview,
    },
    where,
  });
}

function newPage(_, args, context) {
  const userId = getUserId(context);
  return context.prisma.createPage({
    pageNum: args.pageNum,
    content: args.content,
    postedBy: { connect: { id: userId } },
    book: { connect: { id: args.bookId } },
  });
}

function updatePage(_, args, context) {
  getUserId(context);
  const where = {
    id: args.pageId,
  };
  return context.prisma.updatePage({
    data: {
      pageNum: args.pageNum,
      content: args.content,
    },
    where,
  });
}

async function signup(_, args, context) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.createUser({ ...args, password });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

async function login(parent, args, context) {
  const user = await context.prisma.user({ email: args.email });
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
}

module.exports = {
  signup,
  login,
  newBook,
  updateBook,
  newPage,
  updatePage,
};
