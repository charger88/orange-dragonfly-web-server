const http = require('http')
const OrangeDragonflyRequest = require('./request.js')
const OrangeDragonflyResponse = require('./response.js')

/**
 * Web Application
 */
class OrangeDragonflyWebServer {
  /**
   *
   * @param {number} port Port
   * @param {?function} errorHandler callback for system errors
   */
  constructor (port = 8888, errorHandler = null) {
    this._server = null
    this.port = port
    this.errorHandler = errorHandler
  }

  /**
   * Error handler
   *
   * @param {?function} errorHandler callback for system errors
   */
  set errorHandler (errorHandler) {
    this._errorHandler = errorHandler
  }

  /**
   * Error handler
   *
   * @return {?function}
   */
  get errorHandler () {
    return this._errorHandler
  }

  /**
   * Port
   *
   * @param {number} port
   */
  set port (port) {
    this._port = port
  }

  /**
   * Port
   *
   * @return {number}
   */
  get port () {
    return this._port
  }

  /**
   * Start server
   *
   * @param {function} handler Application requests handler
   * @return {Promise<boolean>}
   */
  start (handler) {
    return new Promise(resolve => {
      if (this._server) {
        throw new Error('Server has already started')
      }
      this._server = http.createServer((request, response) => {
        let body = ''
        request.on('data', chunk => {
          body += chunk.toString()
        })
        request.on('end', () => {
          let req = null
          try {
            req = new OrangeDragonflyRequest(request.method, request.url, request.headers, body)
            handler(req).then(res => res.send(response))
          } catch (e) {
            console.error(e)
            let res = this.errorHandler ? this.errorHandler(req, e) : null
            if (!res) {
              res = new OrangeDragonflyResponse()
              res.setError(500, 'Internal Server Error')
            }
            res.send(response)
          }
        })
      })
      this._server.listen(this.port, () => {
        resolve(true)
      })
    })
  }

  /**
   * Stop server
   *
   * @return {Promise<boolean>}
   */
  stop () {
    return new Promise(resolve => {
      this._server.close(() => {
        resolve(true)
      })
    })
  }
}

module.exports = OrangeDragonflyWebServer
