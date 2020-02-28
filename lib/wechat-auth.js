'use strict';

const crypto = require('crypto');
const set = require('lodash.set');
const {UnauthorizedError} = require('./error');

// Util method to verify the signature of the incoming request
const verifyServerRequest = (token, signature, timestamp, nonce) => {
	const tmpStr = [token, timestamp, nonce]
		.sort()
		.toString()
		.replace(/,/g, '');
	const sha1Code = crypto.createHash('sha1');
	const code = sha1Code.update(tmpStr, 'utf-8').digest('hex');
	return code === signature;
};

// Middleware to handle authentication with incoming request from WeChat
// If the signature is valid and is a `POST` request, user `openid` is set to `req.user` by default
// See: https://developers.weixin.qq.com/doc/offiaccount/en/Basic_Information/Access_Overview.html
const wechatAuth = ({token = null, requestProperty = 'user'} = {}) => {
	if (!token) throw new Error('token should be set');

	const verifySignature = (req, res, next) => {
		const {signature, timestamp, nonce, openid, echostr} = req.query;

		if (verifyServerRequest(token, signature, timestamp, nonce)) {
			if (openid) set(req, requestProperty, openid);

			// If `GET` request, do not call the next middleware
			// just return the empty para `echostr` to verify the request
			if (req.method === 'GET') {
				return res.send(echostr);
			}

			return next();
		}

		return next(
			new UnauthorizedError('invalid_signature', {
				message: 'Request signature is in valid.'
			})
		);
	};

	return verifySignature;
};

module.exports = {wechatAuth};
