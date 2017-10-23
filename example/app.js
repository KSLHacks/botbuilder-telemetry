// Require npm packages
require('dotenv').config()
const restify = require('restify')
const builder = require('botbuilder')
const fetch = require('node-fetch')
const ApplyTelemetryMiddleware = require('botbuilder-telemetry')

// =========================================================
// Bot Setup
// =========================================================

// Setup Restify Server
var server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url)
})

// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_PASS
})

var bot = new builder.UniversalBot(connector)
server.post('/api/messages', connector.listen())

// =========================================================
// Middleware: botbuilder-telemetry
// =========================================================
// REQUIRED Configuration Object
var configObject = {
  'botVersion': 'v3',
  'include': {
    'luis': true,
    'qna': false,
    'foo': 'bar'
  }
}

// REQUIRED function: API/Endpoint/DB Connection calls
function dataHandleFunction (body) {
  fetch('https://testEndpoint.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Subscription-Key': process.env.apiKey
    },
    body: body
  }).then(response => {
    return response.json()
  }).then(json => {
  // Read response JSON here...
    console.log(json)
  })
}

// OPTIONAL function: add/mutate and compute data before sending to endpoint
function dataMutationFunction (body, session, event, configObject) {
    // The user message - Cleaned, capped at 255 characters.
  body.userMessage = body.userMessage.trim()
  if (body.userMessage.length > 255) { body.userMessage = body.userMessage.substring(0, 255) }

    // The bot message - Cleaned, capped at 255 characters.
  body.botResponse = body.botResponse.trim()
  if (body.botResponse.length > 255) { body.botResponse = body.botResponse.substring(0, 255) }

    // The bot version - Managed by the bot developer
  if (typeof configObject.botVersion === 'undefined') { body.botVersion = configObject.botVersion }

    // pass configObject.include items into the body
  if (typeof configObject.include !== 'undefined') {
    // Information passed through conversationData
    for (var property in configObject.include) {
      body[property] = configObject.include[property]
    }
  }
}

bot = ApplyTelemetryMiddleware(bot, configObject, dataHandleFunction, dataMutationFunction)
// bot = ApplyTelemetryMiddleware(bot, configObject, dataHandleFunction) // use this if no dataMutationFunction is defined

// =========================================================
// Bots Dialogs
// =========================================================

// present the user with a main menu of choices they can select from
bot.dialog('/', [
  function (session, results) {
    var style = builder.ListStyle['button']
    builder.Prompts.choice(session, 'I can do any of these, pick one!', ['Say Hello', 'Say Goodbye'], { listStyle: style })
  },
  function (session, results) {
    switch (results.response.index) {
      case 0:
        session.send('Hello!')
        break
      case 1:
        session.send('Goodbye!')
        break
    }
  }
])
