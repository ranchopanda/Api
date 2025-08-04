const crypto = require('crypto');

const apiKey = '24d816d605247bde849f68867077b56d62c3958bf05664ce555296af06f1d10f';
const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
console.log('API Key:', apiKey);
console.log('Hash:', hash);
console.log('Expected hash: b5481a0088fdfaa3fe7799a1569f3024fd1438d1b0e41780049dbd48cd69db85');
console.log('Match:', hash === 'b5481a0088fdfaa3fe7799a1569f3024fd1438d1b0e41780049dbd48cd69db85'); 