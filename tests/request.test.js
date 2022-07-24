/* eslint-disable no-undef */

const OrangeDragonflyRequest = require('./../src/request.js')

test('basic request', () => {
  const body = { first_name: 'Donald', last_name: 'Joe' }
  const req = new OrangeDragonflyRequest('POST', '/', { 'user-agent': 'Just a test' }, JSON.stringify(body))
  expect(req.method).toBe('POST')
  expect(req.path).toBe('/')
  expect(req.query).toEqual({})
  expect(req.getHeader('user-agent')).toBe('Just a test')
  expect(req.body).toEqual(body)
})

test('path and no user agent', () => {
  const req = new OrangeDragonflyRequest('GET', '/framework/123/dragonfly/orange', {})
  expect(req.method).toBe('GET')
  expect(req.path).toBe('/framework/123/dragonfly/orange')
  expect(req.query).toEqual({})
  expect(req.getHeader('user-agent', 'Other user agent')).toBe('Other user agent')
  expect(req.body).toEqual('')
})

test('clone', () => {
  const org = new OrangeDragonflyRequest('GET', '/framework/123/dragonfly/orange', {})
  const req = org.clone()
  expect(req.method).toBe('GET')
  expect(req.path).toBe('/framework/123/dragonfly/orange')
  expect(req.query).toEqual({})
  expect(req.getHeader('user-agent', 'Other user agent')).toBe('Other user agent')
  expect(req.body).toEqual('')
})

test('host', () => {
  const req = new OrangeDragonflyRequest('GET', '/', { Host: '127.0.0.1:8080' })
  expect(req.method).toBe('GET')
  expect(req.host).toBe('127.0.0.1:8080')
  expect(req.hostname).toBe('127.0.0.1')
  expect(req.port).toBe(8080)
})

test('query', () => {
  const req = new OrangeDragonflyRequest('GET', '/framework/123/dragonfly/orange?a=1&b[]=2&b[\'three\']=3&b[]=4&c=string&null_property&empty_string=', {})
  expect(req.path).toBe('/framework/123/dragonfly/orange')
  expect(req.query).toEqual({
    a: 1,
    b: { 0: 2, three: 3, 2: 4 },
    c: 'string',
    null_property: null,
    empty_string: ''
  })
  expect(req.getQueryParam('b')).toEqual({ 0: 2, three: 3, 2: 4 })
  expect(req.getQueryParam('c')).toBe('string')
})

test('query - parameter as array', () => {
  const req = new OrangeDragonflyRequest('GET', '/framework/123/dragonfly/orange?arr[]=2&arr[]=3&arr[]=4', {})
  expect(req.path).toBe('/framework/123/dragonfly/orange')
  expect(req.query).toEqual({
    arr: [2, 3, 4]
  })
  expect(req.getQueryParam('arr')).toEqual([2, 3, 4])
})

test('content type', () => {
  const regular = new OrangeDragonflyRequest('GET', '/', { 'content-type': 'application/json' })
  expect(regular.contentType).toBe('application/json')
  expect(regular.contentTypeDetails).toBe('')
  const withCharset = new OrangeDragonflyRequest('GET', '/', { 'content-type': 'text/html; charset=utf-8' })
  expect(withCharset.contentType).toBe('text/html')
  expect(withCharset.contentTypeDetails).toBe('charset=utf-8')
})

test('expected response content type', () => {
  const noAccept = new OrangeDragonflyRequest('GET', '/', {})
  expect(noAccept.expectedResponseContentType).toBe(null)
  const contentTypeNoAccept = new OrangeDragonflyRequest('GET', '/', { 'content-type': 'application/json' })
  expect(contentTypeNoAccept.expectedResponseContentType).toBe('application/json')
  const contentType = new OrangeDragonflyRequest('GET', '/', { 'content-type': 'application/json', accept: 'text/html' })
  expect(contentType.expectedResponseContentType).toBe('text/html')
})

test('multipart form data', () => {
  const requestData = `------WebKitFormBoundaryb1SSVmgvUwx2BwAo
Content-Disposition: form-data; name="sa"


------WebKitFormBoundaryb1SSVmgvUwx2BwAo
Content-Disposition: form-data; name="ta"
content-type: text/plain;charset=windows-1251
content-transfer-encoding: 8BIT

Some value
------WebKitFormBoundaryb1SSVmgvUwx2BwAo
Content-Disposition: form-data; name="zz[q1]"

ZZQ1
------WebKitFormBoundaryb1SSVmgvUwx2BwAo
Content-Disposition: form-data; name="zz[q2]"

ZZQ2
------WebKitFormBoundaryb1SSVmgvUwx2BwAo--`
  const req = new OrangeDragonflyRequest('POST', '/', { 'content-type': 'multipart/form-data; boundary=------WebKitFormBoundaryb1SSVmgvUwx2BwAo' }, requestData)
  expect(req.method).toBe('POST')
  expect(req.path).toBe('/')
  expect(req.query).toEqual({})
  expect(req.contentType).toBe('multipart/form-data')
  expect(req.contentTypeDetails).toBe('boundary=------WebKitFormBoundaryb1SSVmgvUwx2BwAo')
  expect(req.body).toEqual({
    sa: '',
    ta: 'Some value',
    zz: {
      q1: 'ZZQ1',
      q2: 'ZZQ2'
    }
  })
})
