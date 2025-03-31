/* StreamSaver.js */
// This is a slightly modified version of https://github.com/jimmywarting/StreamSaver.js

const StreamSaver = {
  createWriteStream,
  supported: true,
  version: {
    full: '2.0.0',
    major: 2,
    minor: 0,
    dot: 0
  }
}

// The test is if it's transferable
// So far: Firefox, Chrome, Safari and Edge supports transferable streams, but not readable yet.
try {
  // Super advanced duck typing
  // Don't do this at home
  new ReadableStream({ start (c) { c.close() }})
  .getReader()
  .closed
  .then(() => {
    // We could also check if window.WritableStream exists, but transferable streams also applies to that
    StreamSaver.supported = false
  })
} catch (err) {
  // Edge 90 & IE, since they are not transferable although some are readable
  StreamSaver.supported = false
}

function createWriteStream (filename, options) {
  let opts = {
    size: null,
    pathname: null,
    writableStrategy: undefined,
    readableStrategy: undefined
  }

  let bytesWritten = 0 // by StreamSaver.js (not the service worker)
  let downloadUrl = null
  let channel = null
  let ts = 0 /* timestamp */

  // normalize arguments
  if (Number.isFinite(options)) {
    [ opts.size ] = [ options ]
  } else if (options && typeof options === 'object') {
    opts = options
  }

  let {
    size,
    pathname,
    writableStrategy,
    readableStrategy
  } = opts

  if (!pathname) {
    pathname = encodeURIComponent(filename.replace(/\//g, ':'))
      .replace(/['()]/g, escape)
      .replace(/\*/g, '%2A')
  }

  // make absolute url
  pathname = '/' + pathname

  // Only firefox, chrome & opera are supported since only they have transferable streams
  if (!StreamSaver.supported) {
    const url = URL.createObjectURL(new Blob([
      `self.addEventListener('install', event => {
          console.log("Installing for stream saver")
          self.skipWaiting()
        })
        self.addEventListener('activate', event => {
          clients.claim()
          console.log("Clients claimed for stream saver")
        })
        self.onmessage = event => {
          const data = event.data
          console.log("Service worker received a message for stream saver", data)
          let downloadUrl = data.download
          let filename = downloadUrl.split("?")[0].split("/").pop()
          const port = event.ports[0]
          console.log("Creating a new link for", filename)

          let response
          if (data.readableStream) {
            console.log("Creating a response from readable stream")
            response = new Response(data.readableStream)
          } else if (data.download && data.download.startsWith("http")) {
            console.log("Creating a response from fetch of download url")
            response = fetch(data.download)
          } else {
            console.log("Creating an empty response")
            response = new Response()
          }

          if (data.pathname && data.fileName) {
            console.log("Setting pathname to", data.pathname)
            downloadUrl = new URL(downloadUrl || data.fileName)
            downloadUrl.pathname = data.pathname
            filename = downloadUrl.pathname.split("/").pop()
          }
          console.log("Download url is ", downloadUrl, " and filename is " + filename)

          response.then(res => {
            console.log("Got response, cloning it")
            return res.blob()
          }).then(blob => {
            console.log("Got blob", blob)
            const link = document.createElement('a')
            link.setAttribute('download', decodeURI(filename))
            const url = URL.createObjectURL(blob)
            console.log("Got url", url)
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
            console.log("Posting success message back to port")
            port.postMessage({ download: "success" })
          })
        }`
    ], { type: 'text/javascript' }))

    const iframe = document.createElement('iframe')
    iframe.hidden = true
    iframe.src = url
    document.body.appendChild(iframe)
    const sw = iframe.contentWindow.navigator.serviceWorker
    iframe.onload = () => {
      console.log("IFRAME LOADED")
      sw.register(url, { scope: './' }).then(registration => {
      console.log("Registered", registration)
    })
    }

    const origin = "*"
    const chunks = []
    const msgPort = new MessageChannel()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = new Image()
    image.crossOrigin = 'anonymous'
    let loaded = false

    return {
      start () {
        this.isOpen = true
        // console.log("Waiting until iframe is loaded")
        waitForIFrame()
        .then(_ => {
          // console.log("Waiting for SW to register")
          return waitUntilSWRegistered(sw)
        })
        .then(_ => {
          // console.log("SW registered, waiting for it to be ready")
          return waitForSWState(sw, 'activated')
        })
        .then(_ => {
          // console.log("SW activated. Waiting for controller")
          return waitForSWController(sw)
        })
        .then(r => {
          // console.log("Got controller", sw.controller)
          return sw.controller
        })
        .then(controller => {
          controller.postMessage({
            readableStream: true,
            download: false,
            fileName: filename
          }, [msgPort.port2])
        })
      },
      write (chunk) {
        if (!this.isOpen) {
          throw new Error("The writer has been closed, cannot write anymore!")
        }
        ts = Date.now()
        // console.log("Writing a chunk", chunk)
        chunks.push(chunk)
        if (bytesWritten === 0) {
          loaded = true
        }
        bytesWritten += chunk.length

        return Promise.resolve()
      },
      close () {
        if (!this.isOpen) {
          throw new Error("The writer has been closed, cannot close anymore!")
        }
        this.isOpen = false
        ts = Date.now()
        const blob = new Blob(chunks)
        setTimeout(() => {
          // console.log("Posting from port", msgPort)
          msgPort.port1.postMessage({
            readableStream: false,
            download: URL.createObjectURL(blob),
            pathname
          })
          // console.log("Posted from port", msgPort, "with url", URL.createObjectURL(blob))
        }, 200)
        // return
      },
      abort(reason) {
        chunks.length = 0
        msgPort.port1.postMessage('abort')
      },
      get desiredSize () {
        return Math.max(0, bytesWritten - ts)
      },
      get isOpen () {
        return this._isOpen
      },
      set isOpen (val) {
        this._isOpen = val
      }
    }
  }

  function waitForIFrame() {
    return new Promise(rs => {
      if (iframe.contentWindow && iframe.contentDocument) {
        rs()
      } else {
        iframe.onload = rs
      }
    })
  }

  function waitUntilSWRegistered(sw) {
    return new Promise(function (res) {
      if (sw.controller) {
        return res()
      }

      sw.addEventListener('controllerchange', function () {
        console.log("SW CONTROLLER CHANGE")
        res()
      })
    })
  }

  function waitForSWState(sw, state) {
    return new Promise(function (res) {
      function check (registration) {
        console.log("SW STATE: ", registration && registration.active && registration.active.state)
        if (!registration) {
          const register = sw.register(URL.createObjectURL(new Blob([`
// This is required to make a service worker immediately available
self.addEventListener('install', event => self.skipWaiting());
// This is required to make a service worker prioritized over other workers
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
          `])), { scope: './' })
          register.then(check).catch(err => console.error(err))
        } else if (!registration.installing && (!registration.active || registration.active.state === state)) {
          res()
        }
      }
      sw.getRegistration().then(check)
    })
  }

  function waitForSWController(sw) {
    return new Promise(res => {
      if (sw.controller) {
        return res(sw.controller)
      }

      let listener = () => {
        sw.removeEventListener('controllerchange', listener)
        res(sw.controller)
      }

      sw.addEventListener('controllerchange', listener)

      setInterval(() => {
        if (sw.controller) res(sw.controller)
      }, 30)
    })
  }

  return new WritableStream({
    start (controller) {
      // is called immediately, and should perform any actions
      // necessary to acquire access to the underlying sink.
      // If this process is asynchronous, it can return a promise
      // to signal success or failure.
      channel = new MessageChannel()

      return new Promise((resolve, reject) => {
        if (downloadUrl) {
          return reject(new Error('Another download is in progress'))
        }

        const params = new URLSearchParams()

        if (pathname) {
          params.set('pathname', pathname)
        }

        if (size) {
          params.set('size', size)
        }

        channel.port1.onmessage = evt => {
          if (evt.data.download) {
            resolve()
            if (!filename || filename === '') {
              const ws = url.pathname.split('/')
              filename = ws[ws.length - 1]
            }
            if (window.name === 'popunderfilled') {
              // Popunders are not supported since they conflict with SW download logic using links
              // trigger download via a blob link instead
              resolve()
              downloadUrl = null
              return
            }
            downloadUrl = evt.data.download
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            resolve()
          }
        }

        let onerror = null
        let onabort = null
        let onsuccess = null

        const loadEnd = evt => {
          channel.port1.postMessage({
            readableStream: true,
            url: evt.target.result
          })
        }

        reject = error => {
          if (downloadUrl) {
            const a = document.createElement('a')
            a.href = downloadUrl
            document.body.appendChild(a)
            a.click()
            a.remove()
            downloadUrl = null
          }
          channel.port1.onmessage = null
          onerror = null
          onabort = null
          onsuccess = null
          reject(error)
        }

        resolve()
      })
    },
    write (chunk) {
      // is called when a new chunk of data is ready to be written
      // to the underlying sink. It can return a promise to signal
      // success or failure of the write operation. The stream
      // implementation guarantees that this method will be called
      // only after previous writes have succeeded, and never after
      // close or abort is called.

      // TODO: Kind of important that service worker responds back when
      // it has been written. Otherwise we can't handle backpressure
      channel.port1.postMessage(chunk)
      bytesWritten += chunk.byteLength
      return Promise.resolve()
    },
    close () {
      // is called when the stream.close() method is called
      channel.port1.postMessage('end')
      return Promise.resolve()
    },
    abort (reason) {
      // is called when the stream.abort() method is called
      channel.port1.postMessage('abort', reason)
    }
  }, writableStrategy)
}

export default StreamSaver 