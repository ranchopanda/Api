const crypto = require('crypto');

const password = 'admin123';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('Expected hash: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');
console.log('Match:', hash === 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'); 