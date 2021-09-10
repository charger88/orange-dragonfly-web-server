/**
 * Object for HTTP response in Web Application
 */
class OrangeDragonflyResponse {
  /**
   * Constructor
   */
  constructor () {
    this.code = 200
    this.headers = []
    this.content = ''
  }

  /**
   * HTTP response code
   *
   * @param code
   */
  set code (code) {
    this._code = parseInt(code)
  }

  /**
   * HTTP response code
   *
   * @return {number}
   */
  get code () {
    return this._code
  }

  /**
   * Content type
   *
   * @param {string} contentType
   */
  set contentType (contentType) {
    this._contentType = contentType
  }

  /**
   * Content type
   *
   * @return {string}
   */
  get contentType () {
    return this._contentType
  }

  /**
   * Response body
   *
   * @param {string|object} content
   */
  set content (content) {
    this._content = content
    this.contentType = typeof content === 'string'
      ? (content.toLowerCase().includes('<html') ? 'text/html' : 'text/plain')
      : 'application/json'
  }

  /**
   * Response body
   *
   * @return {string|object}
   */
  get content () {
    return this._content
  }

  /**
   * Headers
   *
   * @param {array} headers Array of objects with properties "key" and "value"
   */
  set headers (headers) {
    this._headers = headers
  }

  /**
   * Headers
   *
   * @return {array} Array of objects with properties "key" and "value"
   */
  get headers () {
    return this.contentType ? this._headers.concat([{ name: 'Content-type', value: this.contentType }]) : this._headers
  }

  /**
   * Add header
   *
   * @param name
   * @param value
   * @return {OrangeDragonflyResponse}
   */
  addHeader (name, value) {
    this._headers.push({ name, value })
    return this
  }

  /**
   * Set error which will be returned as json object
   *
   * @param {number} code
   * @param {string} error
   * @param {object} data
   * @return {OrangeDragonflyResponse}
   */
  setError (code, error, data = {}) {
    this.code = code
    this.content = { error, ...data }
    return this
  }

  /**
   * Sends Web App response via Server response
   *
   * @param {ServerResponse} response
   */
  send (response) {
    this.headers.forEach(header => {
      response.setHeader(header.name, header.value)
    })
    response.writeHead(this.code)
    if (this.content) {
      response.write(typeof this.content === 'string' ? this.content : JSON.stringify(this.content, null, 2))
    }
    response.end()
  }
}

module.exports = OrangeDragonflyResponse
