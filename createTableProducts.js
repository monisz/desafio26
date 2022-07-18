const Knex = require('knex').default;
const { mysql } = require('./config');

//Definición tabla productos en MariaDB
const knex = Knex({
    client: 'mysql2',
    connection: mysql.optionsMysql
});
console.log("conectados a mysql");

const defTable = (async () => {
    await knex.schema.dropTableIfExists('products');
    await knex.schema.createTable('products', table => { 
        table.increments('id').primary().notNullable(),
        table.string('title',20).notNullable(),
        table.string('description', 100).notNullable(),
        table.string('code',10).notNullable(),
        table.string('thumbnail').notNullable
        table.float('price').notNullable(),
        table.integer('stock').notNullable(),
        table.string('timestamp')
    });
    console.log("tabla productos creada")
    await knex.destroy();
});

defTable();