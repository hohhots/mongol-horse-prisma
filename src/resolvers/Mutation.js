const glob = require('glob');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { unlink, createWriteStream } = require('fs');
const mkdirp = require('mkdirp');

const { APP_SECRET, getUserId, uploadDir } = require('../utils');

// Ensure upload directory exists
mkdirp.sync(uploadDir);

const deletePrevious = ({ bookId, pageId }) => {
  const file = `${uploadDir}/${bookId}/${pageId}.*`;
  glob(file, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      // a list of paths to javaScript files in the current working directory
      console.log(files);
      files.map(
        async (file) =>
          await unlink(file, (err) => {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log('File deleted!');
          }),
      );
    }
  });
};

const storeUpload = async ({ stream, mimetype, bookId, pageId }) => {
  mimetype = mimetype.split('/')[1];
  let path = `${uploadDir}/${bookId}`;
  mkdirp.sync(path);
  path = `${path}/${pageId}.${mimetype}`;
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ pageId, path }))
      .on('error', reject),
  );
};

const processUpload = async (photo, bookId, pageId) => {
  deletePrevious({ bookId, pageId });

  const { createReadStream, filename, mimetype, encoding } = await photo;
  const stream = createReadStream();
  const { id } = await storeUpload({
    stream,
    mimetype,
    bookId,
    pageId,
  });
  return { id, filename, mimetype, encoding, bookId, pageId };
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

async function uploadPhoto(_, { file, bookId, pageId }, context) {
  getUserId(context);
  return processUpload(file, bookId, pageId);
}

module.exports = {
  signup,
  login,
  newBook,
  updateBook,
  newPage,
  updatePage,
  uploadPhoto,
};
