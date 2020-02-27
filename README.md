# Watson Assistant for WeChat

[![codecov](https://codecov.io/gh/IBM/watson-assistant-for-wechat/branch/master/graph/badge.svg)](https://codecov.io/gh/IBM/watson-assistant-for-wechat)

Watson Assistant integration in WeChat for ExpressJS.

## Usage

### Install

```bash
yarn install watson-assistant-for-wechat
```

OR

```bash
npm i watson-assistant-for-wechat
```

### Example

Detail example is avaliable at [app.js](./app.js).

```js
const {wechatWatsonAssistant} = require('watson-assistant-for-wechat');

// Initialize the applicatoin, and mount the endpoint at `/watson`
wechatWatsonAssistant(app, config, '/watson');

app.post('/watson', async (req, res) => {
	const {user, message} = req;
	const {chat} = req.app.locals;
  const storage = req.sessionStore;

  // Retrive sessionId of current WeChat user
  const sessionId = await getSessionId();

  // Post incoming text to Watson Assistant
  const {result: assistantResponse} = await chat(
    {message_type: 'text', text: message.Content},
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
}
```

### Configuration

Below is a list of avaliable configuration.

```js
// Initialize the applicatoin, and mount the endpoint at `/watson`
wechatWatsonAssistant(
  app,
  {
    apiKey: process.env.IBM_CLOUD_IAM_KEY,
    assistantId: process.env.IBM_WATSON_ASSISTANT_ID,
    wechatToken: process.env.WECHAT_TOKEN,
    version: "2020-02-05",
    url: "https://api.us-south.assistant.watson.cloud.ibm.com",
    chatRequestProperty: "locals.chat",
    messageRequestProperty: "message",
    userRequestProperty: "user"
  },
  "/watson"
);
```

#### Options

##### apiKey (required)

IBM Cloud IAM API Key, see [IBM Cloud Documentation](https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#authentication)

##### assistantId (required)

The ID of the Watson Assistant instance.

Avaliable at Launch assistant -> Top Right (settings) -> API Details

##### wechatToken (required)

The token set at WeChat server endpoint configuration, see [WeChat Documentation](https://developers.weixin.qq.com/doc/offiaccount/en/Basic_Information/Access_Overview.html)

##### version

Default value `2020-02-05`

Watson Assistant API version, see [IBM Cloud Documentation](https://cloud.ibm.com/apidocs/assistant/assistant-v2#versioning)

##### url

Default value `https://api.us-south.assistant.watson.cloud.ibm.com`

Watson Assistant API endpoint, see [IBM Cloud Documentation](https://cloud.ibm.com/apidocs/assistant/assistant-v2#service-endpoint)

##### chatRequestProperty

Default value `locals.chat`

The name of property under `app` where to attach the `chat` method

```js
const { chat } = req.app.locals;
```

##### messageRequestProperty

Default value `message`

The name of property under `req` where to attach the incoming message from WeChat server

```js
const { message } = req;
```

##### userRequestProperty

Default value `user`

The name of property under `req` where to attach the ID of incoming WeChat user

```js
const { user } = req;
```

## Development

### Require

- NodeJS: `>=12`
- Yarn

### Setup

- `cp .env.example .env`
- `yarn install`
- `yarn dev`

## Author

- IBM Cognitive Class, IBM Digital Business Group
