const crypto = require('crypto');

function getGravatarUrl(email) {
  const emailHash = crypto.createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');
  
  console.log('Gravatar sha256: ', emailHash);

  let gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
  return gravatarUrl;
}

module.exports = getGravatarUrl;
