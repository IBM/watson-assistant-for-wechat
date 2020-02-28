const crypto = require('crypto');

function generateSignedQueryString(token) {
	// Create signatrue based on token
	const [timestamp, nonce, echostr] = [
		Math.floor(Date.now() / 1000).toString(),
		parseInt(crypto.randomBytes(5).toString('hex'), 16).toString(),
		parseInt(crypto.randomBytes(5).toString('hex'), 16).toString()
	];
	const tmpStr = [token, timestamp, nonce]
		.sort()
		.toString()
		.replace(/,/g, '');

	const sha1Code = crypto.createHash('sha1');
	const signature = sha1Code.update(tmpStr, 'utf-8').digest('hex');

	return {
		signature,
		echostr,
		timestamp,
		nonce
	};
}

module.exports = {
	generateSignedQueryString
};
