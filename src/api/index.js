let KoaBody = require('koa-body')
let Router = require('koa-router')
let _ = require('lodash')
let { getColl } = require('../db')
let { PRODUCTS } = require('../const')
let { env } = require('../../config')

exports.registerApi = registerApi

let apiRouter = new Router({ prefix: '/api' })
apiRouter.use(KoaBody())

apiRouter.use(async (ctx, next) => {
  let { body } = ctx.request
  if (body && _.isString(body)) {
    try {
      ctx.request.body = JSON.parse(body)
    } catch (err) {
      throw new Error(`invalid json body, got: ${body}`)
    }
  }
  await next()
})

// api cors
apiRouter.use(async (ctx, next) => {
  console.log('api cors')
  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    ctx.status = 204
  }
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
})

// api error-handling
// https://github.com/koajs/koa/blob/master/docs/error-handling.md
apiRouter.use(async (ctx, next) => {
  console.log('api error handleing')
  try {
    await next()
  } catch (err) {
    if (env === 'production') {
      ctx.body = { error: 'Internal Server Error' }
    } else {
      ctx.body = { error: err.message }
    }
    ctx.status = err.status || 500
    console.error('api error:', err)
  }
})

;[PRODUCTS].forEach(resource => {
  let { registerResource } = require(`./${resource}`)
  registerResource(apiRouter)
})

// middleware: /list validation
apiRouter.get('/:resource/list', async (ctx, next) => {
  let { resource } = ctx.params
  let { listFilter } = ctx.state
  if (!listFilter) {
    throw new Error(`missing listFilter, resource key got "${resource}"`)
  }
  await next()
})

function registerApi (app) {
  app.use(apiRouter.routes())
  // app.use(apiRouter.allowedMethods())
}
