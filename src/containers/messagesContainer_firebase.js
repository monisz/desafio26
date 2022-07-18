const admin = require('firebase-admin');
const { firebase } = require('../../config');
const normalize = require('normalizr');
const print = require('../../utils/print');

admin.initializeApp({
    credential: admin.credential.cert(firebase.firebaseConfig)
});
console.log("conectados a firebase");

const db = admin.firestore();

class Container {
    constructor (collection) {
        this.collection = db.collection(collection);
        this.id = 1;
    }    

    async save(element) {
        try {
            const allItems = await this.collection.get(); 
            const docs = allItems.docs;
            const id = docs.length + 1;
            const idDoc = "" + id;
            try {
                const elementToSave = this.collection.doc(idDoc);
                await elementToSave.create(element);
                console.log("agregado exitoso", element.email);
                const allItemsNorm = await colMessages.getAll();
                return allItemsNorm;
            }
            catch (error) {
                console.log("el error al guardar fue: ", error);
            }
        }
        catch (error) {
            console.log("error en Save): ", error);
        }
    }

    async getAll() {
        try {
            const allItems = await this.collection.get();
            const docs = allItems.docs;
            const messages = docs.map((doc) => ({
                id : doc.id,
                author: doc.data().author,                
                date: doc.data().date,
                text: doc.data().text    
            }));
            const messagesNormalized = this.normalizer(messages);
            return messagesNormalized;
        }
        catch (error) {
            console.log("error en getAll): ", error);
            return [];
        }
    }

    async normalizer(messages) {
        const messagesToNorm = {
            id: 'mensajes',
            messages : messages
        };

        const authorSchema = new normalize.schema.Entity('authors', {}, {idAttribute: 'email'});
        const messageSchema = new normalize.schema.Entity('message', { 
            author: authorSchema
        });
        const messagesSchema = new normalize.schema.Entity('messages', {
            messages: [ messageSchema ]
        });
        const normalizedMessages = normalize.normalize(messagesToNorm, messagesSchema);
        //print(normalizedMessages);
        return normalizedMessages;
    }
}

const colMessages = new Container('messages');

module.exports = colMessages;

