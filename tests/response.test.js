/* eslint-disable no-undef */

const OrangeDragonflyResponse = require('./../src/response.js')

const HTML_EXAMPLE = '<html><body>Hello world!</body></html>'

const getContentTypeHeader = (value) => {
  return { name: 'Content-type', value }
}

test('default response', () => {
  const req = new OrangeDragonflyResponse()
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([getContentTypeHeader('text/plain')])
  expect(req.content).toBe('')
})

test('json', () => {
  const req = new OrangeDragonflyResponse()
  req.content = { test: 123 }
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([getContentTypeHeader('application/json')])
  expect(req.content).toEqual({ test: 123 })
})

test('html', () => {
  const req = new OrangeDragonflyResponse()
  req.content = HTML_EXAMPLE
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([getContentTypeHeader('text/html')])
  expect(req.content).toBe(HTML_EXAMPLE)
})

test('override content type', () => {
  const req = new OrangeDragonflyResponse()
  req.content = HTML_EXAMPLE
  req.contentType = 'application/octet-stream'
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([getContentTypeHeader('application/octet-stream')])
  expect(req.content).toBe(HTML_EXAMPLE)
})

test('override content type with content', () => {
  const req = new OrangeDragonflyResponse()
  req.contentType = 'application/octet-stream'
  req.content = HTML_EXAMPLE
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([getContentTypeHeader('text/html')])
  expect(req.content).toBe(HTML_EXAMPLE)
})

test('add header', () => {
  const req = new OrangeDragonflyResponse()
  req.addHeader('X-Version', '1.0.0')
  req.content = HTML_EXAMPLE
  expect(req.code).toBe(200)
  expect(req.headers).toEqual([{ name: 'X-Version', value: '1.0.0' }, getContentTypeHeader('text/html')])
  expect(req.content).toBe(HTML_EXAMPLE)
})

test('set error', () => {
  const req = new OrangeDragonflyResponse()
  req.content = HTML_EXAMPLE
  req.setError(422, 'Validation error', { parameters: { login: 'Incorrect login' } })
  expect(req.code).toBe(422)
  expect(req.content).toEqual({ error: 'Validation error', parameters: { login: 'Incorrect login' } })
})
