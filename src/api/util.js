let _ = require('lodash')
let KoaBody = require('koa-body')
let fs = require('fs-extra-promise')
let escStrRegex = require('escape-string-regexp')
let { app: { uploadDir } } = require('../../config')

fs.ensureDirSync(uploadDir)

const koaBody = KoaBody()
const koaUpload = KoaBody({
  multipart: true,
  keepExtensions: true,
  formidable: { uploadDir }
})

exports.koaUpload = koaUpload

exports.strToRegex = strToRegex
function strToRegex (str) {
  str = escStrRegex(str)
  return new RegExp(str)
}

exports.koaJson = koaJson
async function koaJson (ctx, next) {
  const nx = async () => {
    let { body } = ctx.request
    if (body && _.isString(body)) {
      try {
        body = JSON.parse(body)
      } catch (err) {
        ctx.throw(400, 'json解析出错')
      }
      if (!_.isObject(body)) {
        ctx.throw(400, 'json必须为object类型')
      }
      ctx.request.body = body
    }
    await next()
  }
  await koaBody(ctx, nx)
}

exports.koaPagin = koaPagin
async function koaPagin (ctx, next) {
  if (ctx.method === 'GET') {
    let { page, skip, limit } = ctx.query
    limit = parseInt(limit) || 10
    if ('skip' in ctx.query) {
      skip = parseInt(skip) || 0
    } else {
      page = parseInt(page) || 1
      skip = limit * (page - 1)
    }
    // todo: 可多个字段 组合sort传入
    // 默认按日期逆序
    // let sort = [['createdAt', -1], ['_id', -1]]
    let sort = { _id: -1 }
    ctx.state.pagin = { skip, limit, sort }
  }
  await next()
}
