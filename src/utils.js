const fs = require('fs');

const jwt = require('jsonwebtoken');
const APP_SECRET = '^3Mongol-6Horse*';
const image_types = ['png', 'jpg'];
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
  for (let i = 0; i < image_types.length; i++) {
    const path = `${uploadDir}/${bookid}/${pageid}.${image_types[i]}`;
    if (fs.existsSync(path)) {
      imageType = image_types[i];
    }
  }
  return imageType;
}

module.exports = {
  APP_SECRET,
  getUserId,
  getFileType,
  uploadDir,
};
