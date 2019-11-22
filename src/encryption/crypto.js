let crypto = require('crypto');

const algorithm = 'aes-192-cbc';
const password = '自己的秘钥';
const key = crypto.scryptSync(password, 'salt', 24);
const iv = Buffer.alloc(16, 0);

function encry(str){
   let cipher = crypto.createCipher(algorithm,key,iv);
   let encrypted =  cipher.update(str);
   encrypted +=cipher.final('hex');
   return encrypted;
}

function decip(str){
   let decipher = crypto.createDecipher(algorithm,key,iv);
   let decipherted = decipher.update(str,'hex','utf-8');
   decipherted += decipher.final('utf-8');
   return decipherted
}

module.exports = {
    encry,
    decip
}