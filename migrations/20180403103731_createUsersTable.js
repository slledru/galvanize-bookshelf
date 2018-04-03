exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', (table) => {
    table.increments()
    table.varchar('first_name', 255).notNullable().defaultTo('')
    table.varchar('last_name', 255).notNullable().defaultTo('')
    table.varchar('email', 255).notNullable()
    table.specificType('hashed_password', 'CHAR(60)').notNullable()
    table.dateTime('created_at').notNullable().defaultTo(knex.raw('now()'))
    table.dateTime('updated_at').notNullable().defaultTo(knex.raw('now()'))
  })
    .then(() => {
      return knex.schema.alterTable('users', (table) => {
        table.unique('email')
      })
    })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users')
}
