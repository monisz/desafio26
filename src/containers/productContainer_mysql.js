const Knex = require('knex').default;
const { mysql } = require('../../config');
const { faker } = require('@faker-js/faker');
faker.locale = "es";

const knex = Knex({
    client: 'mysql',
    connection: mysql.optionsMysql
});
console.log("conectados a mysql");

class Container {
    constructor (table) {
        this.table = table;
    }    

    async save(element) {
        try {
            console.log("el que recibe en save", element)
            const res = await knex(this.table).insert(element);
            return res;
        }
        catch (error) {
            console.log("error en Save): ", error);
            return [];
        }
    }
    

    //Agregué este método para complementar el put por id
    async replaceById(idSearch, data) {
        try {
            const doc = await this.getById(idSearch);
            let newDoc = {...doc[0],...data}
            const result = await knex.from(this.table).where({id : idSearch}).update({
                title: newDoc.title,
                description: newDoc.description,
                code: newDoc.code,
                thumbnail: newDoc.thumbnail,
                price: newDoc.price,
                stock: newDoc.stock
            });
            return result;
        }
        catch (error) {
            console.log("error al reemplazar datos: ", error);
            return null;
        }
    }

    async getById(idSearch) {
        try {
            const doc = await knex.from(this.table).where({id : idSearch});
            return doc;
        }
        catch (error) {
            console.log("error al buscar por id: ", error);
        }
    }

    async getAll() {
        try {
            const products = await knex.from(this.table).select('*');
            return products;
        }
        catch (error) {
            console.log("error en getAll): ", error);
            return [];
        }
    }

    async deleteById(idSearch) {
        try {
            const result = await knex.from(this.table).where({id: idSearch}).del();
            return result;
        }
        catch (error) {
            console.log("error en deleteById): ", error);
        }
    }

    generateMock () {
        const mocks = [];
        let mock = {};
        for ( let i = 0; i < 5; i++) {
            mock = {
                title: faker.commerce.product(),
                price: faker.commerce.price(),
                thumbnail: faker.image.image()
            }
            mocks.push(mock);
        }
        return mocks;
    }
};

const tableProducts = new Container('products');

module.exports = tableProducts;

