const fs = require('fs');

const jwt = require('jsonwebtoken');
const APP_SECRET = '^3Mongol-6Horse*';
const image_types = ['png', 'jpeg'];
const uploadDir = './booksImage';

function getUserId(context) {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }

  throw new Error('Not authenticated');
}

function getFileType(bookid, pageid) {
  let imageType = '';
  image_types.some((type) => {
    if (fs.existsSync(`${uploadDir}/${bookid}/${pageid}.${type}`)) {
      imageType = type;
      return true;
    }
    return false;
  });
  return imageType;
}

module.exports = {
  APP_SECRET,
  getUserId,
  getFileType,
  uploadDir,
};
