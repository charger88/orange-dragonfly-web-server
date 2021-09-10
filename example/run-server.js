const { OrangeDragonflyWebServer, OrangeDragonflyResponse } = require('./../index.js')

const handler = async r => {
  console.log((new Date()).toISOString(), r.method, r.path)
  const response = new OrangeDragonflyResponse()
  response.content = 'Hello world!'
  return response
}

const app = new OrangeDragonflyWebServer()

app.start(handler).then(() => {
  console.log((new Date()).toISOString(), 'App started')
})
