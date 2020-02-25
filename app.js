'use strict';

const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const {reply} = require('node-weixin-message');
const {wechatWatsonAssistant} = require('./lib');

const app = express();

// Debug stuffs for dev
if (process.env.NODE_ENV !== 'production') {
	// Dashboard is accessible at `${host}:${port}/expressVisualizer/visualize`
	require('express-middleware-visualizer')(app);
	require('dotenv').config();
}

// Add requests logger
app.use(morgan('tiny'));

// Session
// You can easily use any other compatible session store
// https://github.com/expressjs/session#compatible-session-stores
const memoryStore = new MemoryStore({
	checkPeriod: 86400000 // Prune expired entries every 24h
});

app.use(
	session({
		store: memoryStore,
		resave: false,
		saveUninitialized: true,
		secret: 'super secure secret (CHANGE ME!!)'
	})
);

// Service configuration
const config = {
	apiKey: process.env.IBM_CLOUD_IAM_KEY, // https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#authentication
	assistantId: process.env.IBM_WATSON_ASSISTANT_ID, // Avaliable at Launch assistant -> Top Right (settings) -> API Details
	wechatToken: process.env.WECHAT_TOKEN // https://developers.weixin.qq.com/doc/offiaccount/en/Basic_Information/Access_Overview.html
};

wechatWatsonAssistant(app, config, '/watson');

app.post('/watson', async (req, res) => {
	const {user, message} = req;
	const {chat} = req.app.locals;
	const storage = req.sessionStore;

	// Method to retrive the user sessionId for watson assistant
	// This is used to presist the state of user conversation
	// See: https://cloud.ibm.com/docs/assistant?topic=assistant-api-client-get-context
	const getSessionId = () =>
		new Promise((resolve, reject) => {
			storage.get(user, (err, session) => {
				if (err) reject(err);
				resolve(session);
			});
		});

	const setSessionId = sessionId =>
		new Promise((resolve, reject) => {
			storage.set(user, sessionId, (err, session) => {
				if (err) reject(err);
				resolve(session);
			});
		});

	const clearSessionId = () => {
		storage.destroy(user);
	};

	// Retrive sessionId of current WeChat user
	const sessionId = await getSessionId();

	// Post incoming text to Watson Assistant
	const {result: assistantResponse} = await chat(
		{message_type: 'text', text: message.Content}, // eslint-disable-line camelcase
		sessionId,
		setSessionId
	);

	// Generate response to WeChat server
	const response = reply.text(
		message.ToUserName,
		message.FromUserName,
		assistantResponse.output.generic[0].text
	);
	res.set('Content-Type', 'text/xml');
	res.send(response);
});

// Global error handling
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).send('Server Error');
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening at http://127.0.0.1:${port}`));
