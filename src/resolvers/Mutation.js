const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createWriteStream } = require('fs');
const mkdirp = require('mkdirp');

const { APP_SECRET, getUserId } = require('../utils');

const uploadDir = './booksImage';

// Ensure upload directory exists
mkdirp.sync(uploadDir);

const storeUpload = async ({ stream, bookId, pageId }) => {
  mkdirp.sync(`${uploadDir}/${bookId}`);
  const path = `${uploadDir}/${bookId}/${pageId}`;
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ pageId, path }))
      .on('error', reject),
  );
};

const processUpload = async (upload, bookId, pageId) => {
  const { createReadStream, mimetype, encoding } = await upload;
  const stream = createReadStream();
  const { id, path } = await storeUpload({
    stream,
    bookId,
    pageId,
  });
  return { id, bookId, pageId, mimetype, encoding, path };
};

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

async function login(_, args, context) {
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

async function uploadFile(_, { file, bookId, pageId }) {
  return processUpload(file, bookId, pageId);
}

module.exports = {
  signup,
  login,
  newBook,
  updateBook,
  newPage,
  updatePage,
  uploadFile,
};
