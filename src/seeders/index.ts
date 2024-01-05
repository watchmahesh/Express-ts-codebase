import db from '@config/db'
import seedUsers from './users'

const seedItems = async () => {
  await seedUsers()
  console.log('Items seeded successfully!!!')
  process.exit()
}

db.once('open', function () {
  seedItems()
})
