let { init, onError } = require('../src/proc')
let { User, Order, Product } = require('../src/model')

init('db-uninst')
main().catch(onError)

async function main () {
  for (let Model of [User, Product, Order]) {
    await Model.dangerouslyDrop()
  }
  await User.closeDb()
}
