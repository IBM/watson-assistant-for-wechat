'use strict';

const set = require('lodash.set');

/**
 * ```js
 * // message.FromUserName
 * // message.ToUserName
 * // message.CreateTime
 * // message.MsgType
 * // message.Content
 * // message.MsgId
 * const { message } = req;
 * ```
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
const wechatMessageHandler = ({requestProperty = 'message'} = {}) => {
	const parseWeChatMessage = (req, res, next) => {
		const message = {};
		Object.keys(req.body.xml).forEach(each => {
			const [item] = req.body.xml[each];
			message[each] = item;
		});
		set(req, requestProperty, message);
		next();
	};

	return parseWeChatMessage;
};

module.exports = {
	wechatMessageHandler
};
