'use strict';

const AssistantV2 = require('ibm-watson/assistant/v2');
const {IamAuthenticator} = require('ibm-watson/auth');
const bodyParser = require('body-parser');
const xmlBodyParser = require('body-parser-xml');
const set = require('lodash.set');
const {wechatAuth} = require('./wechat-auth');
const {wechatMessageHandler} = require('./wechat-message-handler');

/**
 * Avaliable plugin
 * `app.locals.chat` - Watson conversation message method
 * `req.user` - user openid
 * `req.message` - incoming POST request message
 * @param {Object} app
 * @param {Object} options
 * @param {String} path - Path to mount the endpoint, default to root
 */
const wechatWatsonAssistant = (app, options, path = '/') => {
	const defaultOptions = {
		version: '2020-02-05',
		url: 'https://api.us-south.assistant.watson.cloud.ibm.com',
		chatRequestProperty: 'locals.chat',
		messageRequestProperty: 'message',
		userRequestProperty: 'user'
	};

	options = {
		...defaultOptions,
		...options
	};

	// Initialize watson assistant client
	const assistant = new AssistantV2({
		version: options.version,
		authenticator: new IamAuthenticator({
			apikey: options.apiKey
		}),
		url: options.url
	});

	const {
		assistantId,
		userRequestProperty,
		messageRequestProperty,
		chatRequestProperty
	} = options;

	const chat = async (input, sessionId, setSessionId = null) => {
		if (!sessionId) {
			const resp = await assistant.createSession({assistantId});
			sessionId = resp.result.session_id;
			if (setSessionId) await setSessionId(sessionId);
		}

		console.log(`Session ID: ${sessionId}`);

		return assistant.message({
			input,
			assistantId,
			sessionId
		});
	};

	// Middleware to handle authentication and requests
	app.use(
		path,
		wechatAuth({
			token: options.wechatToken,
			requestProperty: userRequestProperty
		})
	);
	xmlBodyParser(bodyParser);
	app.use(
		path,
		bodyParser.xml(),
		wechatMessageHandler({requestProperty: messageRequestProperty})
	);

	// Attach `chat` method to the ExpressJS
	set(app, chatRequestProperty, chat);
};

module.exports = {
	wechatWatsonAssistant
};
