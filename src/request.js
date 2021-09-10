/**
 * Object for HTTP request in Web Application
 */
class OrangeDragonflyRequest {
  /**
   *
   * @param {string} method HTTP method
   * @param {string} url URL (path, query)
   * @param {object} headers Headers
   * @param {string} body Body of HTTP request
   */
  constructor (method, url, headers = {}, body = '') {
    this.method = method
    this.url = url
    this.headers = headers
    this._u = new URL(`http://${this.getHeader('host', 'localhost')}${this.url}`)
    this._query = null
    this._rawBody = body
    this._parsedBody = null
    this._parsedBodyCreated = false
  }

  /**
   * Request method (uppercase)
   * @return {string}
   */
  get method () {
    return this._method
  }

  /**
   * Request method (uppercase)
   * @param {string} method
   */
  set method (method) {
    this._method = method.toUpperCase()
  }

  /**
   * URL (path and query string)
   * @return {string}
   */
  get url () {
    return this._url
  }

  /**
   * URL (path and query string)
   * @param {string} url
   */
  set url (url) {
    this._url = url
  }

  /**
   * Headers
   * @return {object}
   */
  get headers () {
    return this._headers
  }

  /**
   * Headers
   * @param {object} headers
   */
  set headers (headers) {
    const h = {}
    for (const [k, v] of Object.entries(headers)) {
      h[k.toLowerCase()] = v
    }
    this._headers = h
  }

  /**
   * Host
   * @return {string}
   */
  get host () {
    return this._u.host
  }

  /**
   * Hostname
   * @return {string}
   */
  get hostname () {
    return this._u.hostname
  }

  /**
   * Port
   * @return {?number}
   */
  get port () {
    return this._u.port ? parseInt(this._u.port) : null
  }

  /**
   * Path
   * @return {string}
   */
  get path () {
    return this._u.pathname
  }

  /**
   * Query string converted to object
   * @return {object}
   */
  get query () {
    if (this._query === null) {
      this._query = this._u.search ? this.constructor._parseQuery(this._u.search.slice(1)) : {}
    }
    return this._query
  }

  /**
   * Converts array query string elements to object
   *
   * @param {array} v array of arrays where first element is name, second is value
   * @return {object}
   * @private
   */
  static _convertArrayToObject (v) {
    return v.reduce((q, c) => {
      const [p, v] = c
      const pn = p.match(/(.+)\[(.*)]/)
      if (pn) {
        if (!q[pn[1]]) {
          q[pn[1]] = {}
        }
        if (pn[2] && ['"', "'"].includes(pn[2].slice(0, 1))) {
          pn[2] = pn[2].slice(1)
        }
        if (pn[2] && ['"', "'"].includes(pn[2].slice(-1))) {
          pn[2] = pn[2].slice(0, -1)
        }
        q[pn[1]][pn[2] ? pn[2] : Object.keys(q[pn[1]]).length] = v
      } else {
        q[p] = v
      }
      return q
    }, {})
  }

  /**
   * Converts query string to object
   *
   * @param {string} queryString
   * @return {Object}
   * @private
   */
  static _parseQuery (queryString) {
    return this._convertArrayToObject(queryString.split('&').map(v => {
      if (v.includes('=')) {
        v = v.split('=')
        const p = decodeURIComponent(v.shift())
        v = v.join('=')
        v = /^\d+$/.test(v) ? parseInt(v) : decodeURIComponent(v)
        return [p, v]
      } else {
        return [decodeURIComponent(v), null]
      }
    }))
  }

  /**
   * Body of HTTP request
   *
   * @param {string} rawBody
   */
  set body (rawBody) {
    const contentType = this.contentType
    if (contentType === 'application/x-www-form-urlencoded') {
      this._parsedBody = this.constructor._parseQuery(this._rawBody)
    } else if (contentType === 'multipart/form-data') {
      // This is RFC: https://www.ietf.org/rfc/rfc2388.txt
      // This function doesn't support everything, but it should work fine for the majority of everyday scenarios
      this._parsedBody = this.constructor._convertArrayToObject(this._rawBody.split(this.contentTypeDetails.split('=')[1].trim()).slice(1, -1).map(v => {
        try {
          const slashR = v.includes('\r')
          const c = (slashR ? v.replace(/\r/g, '') : v)
            .split('\n')
            .slice(1, -1) // Removing empty lines
          let name = null
          while (c.length) {
            const l = c.shift()
            if (!l.length) break
            if (l.toLowerCase().startsWith('content-disposition')) {
              const nameMatch = l.match('name="([^\\"]+)"')
              name = nameMatch ? nameMatch[1] : null
            }
          }
          return [name, c.join(slashR ? '\r\n' : '\n')]
        } catch (e) {
          console.warn(e)
          return [null, null]
        }
      }).filter(v => {
        return v[0] !== null
      }))
    } else if (contentType === 'application/json') {
      try {
        this._parsedBody = JSON.parse(rawBody)
      } catch (e) {
        this._parsedBody = {}
      }
    } else {
      try {
        this._parsedBody = JSON.parse(rawBody) || rawBody
      } catch (e) {
        this._parsedBody = this._rawBody
      }
    }
    this._parsedBodyCreated = true
  }

  /**
   * Body of HTTP request
   *
   * @return {null|object|string}
   */
  get body () {
    if (!this._parsedBodyCreated) {
      this.body = this._rawBody
    }
    return this._parsedBody
  }

  /**
   * Content type
   *
   * @return {string}
   */
  get contentType () {
    const contentType = this.getHeader('content-type', '').split(';')
    return contentType[0]
  }

  /**
   * Charset or another additional information from content type
   *
   * @return {string}
   */
  get contentTypeDetails () {
    const contentType = this.getHeader('content-type', '').split(';')
    return contentType.length > 1 ? contentType.slice(1).map(v => v.trim()).join(';') : ''
  }

  /**
   * Expected response content type
   *
   * @return {?string}
   */
  get expectedResponseContentType () {
    let type = null
    const accept = this.getHeader('accept')
    if (accept && accept.length) {
      type = this.getHeader('accept').split(',').map(v => v.trim())[0]
      if (type.includes('*')) {
        type = null
      }
    }
    if (type === null) {
      const request = this.contentType
      if (request && request.length && request.includes('json')) {
        type = 'application/json'
      }
    }
    if (type === null) {
      type = null
    }
    return type
  }

  /**
   * Returns header
   *
   * @param {string} name
   * @param {*} def
   * @return {*}
   */
  getHeader (name, def = null) {
    return this.headers[name.toLowerCase()] || def
  }

  /**
   * Get query string parameter
   *
   * @param {string} name
   * @param {*} def
   * @return {*}
   */
  getQueryParam (name, def = null) {
    return this.query[name] || def
  }

  /**
   * Clone object
   *
   * @return {OrangeDragonflyRequest}
   */
  clone () {
    return new this.constructor(this.method, this.url, this.headers, this._rawBody)
  }
}

module.exports = OrangeDragonflyRequest
