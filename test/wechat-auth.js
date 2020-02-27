const test = require('ava');
const crypto = require('crypto');
const sinon = require('sinon');
const get = require('lodash.get');
const {wechatAuth} = require('../lib/wechat-auth');
const {generateSignedQueryString} = require('./helper/sign-signature');

const wechatToken = 'some_token';

test('should throw if token is not set', t => {
	const error = t.throws(() => {
		wechatAuth();
	});
	t.is(error.message, 'token should be set');
});

test('should pass if signature is valid for GET request', t => {
	// Create signatrue based on token
	const query = generateSignedQueryString(wechatToken);
	const req = {
		method: 'GET',
		query
	};

	// Mock Response object
	const mockResponse = () => {
		const res = {};
		res.status = sinon.stub().returns(res);
		res.json = sinon.stub().returns(res);
		res.send = sinon.stub().returns(res);
		return res;
	};

	const res = mockResponse();

	// Expect call res.send() with echostr
	wechatAuth({token: wechatToken})(req, res, () => {});
	t.true(res.send.calledOnce);
	t.true(res.send.calledWith(query.echostr));
});

test('should pass if signature is valid for POST request', t => {
	// Create signatrue based on token
	const query = generateSignedQueryString(wechatToken);
	const req = {
		method: 'POST',
		query
	};

	// Mock Response object
	const res = {};
	const callback = sinon.fake();

	// Expect call next()
	wechatAuth({token: wechatToken})(req, res, callback);
	t.true(callback.calledOnce);
	t.true(callback.calledWith());
});

test.cb('should throw if request is signed by different token', t => {
	const query = generateSignedQueryString('wrong_token');
	const req = {
		method: 'GET',
		query
	};

	// Mock Response object
	const res = {};

	// Expect error
	wechatAuth({token: wechatToken})(req, res, err => {
		t.is(err.status, 401);
		t.is(err.code, 'invalid_signature');
		t.end();
	});
});

test.cb('should throw if signature is invalid', t => {
	const req = {
		method: 'GET',
		query: {
			signature: 'foo',
			timestamp: 'bar',
			nonce: 'foo',
			echostr: 'random_string'
		}
	};
	const res = {};

	wechatAuth({token: wechatToken})(req, res, err => {
		t.is(err.status, 401);
		t.is(err.code, 'invalid_signature');
		t.end();
	});
});

test.cb('should set default requestProperty if no option provided', t => {
	// Create signatrue based on token
	const query = generateSignedQueryString(wechatToken);
	const openid = parseInt(crypto.randomBytes(5).toString('hex'), 16).toString();
	const req = {
		method: 'POST',
		query: {
			...query,
			openid
		}
	};

	// Mock Response object
	const res = {};

	wechatAuth({token: wechatToken})(req, res, () => {
		t.is(req.user, openid);
		t.end();
	});
});

test.cb('should set custom requestProperty if option provided', t => {
	// Create signatrue based on token
	const query = generateSignedQueryString(wechatToken);
	const openid = parseInt(crypto.randomBytes(5).toString('hex'), 16).toString();
	const req = {
		method: 'POST',
		query: {
			...query,
			openid
		}
	};

	// Mock Response object
	const res = {};

	const customRequestPropertyName = 'custom.userProperty';
	wechatAuth({
		token: wechatToken,
		requestProperty: customRequestPropertyName
	})(req, res, () => {
		t.is(get(req, customRequestPropertyName), openid);
		t.end();
	});
});
