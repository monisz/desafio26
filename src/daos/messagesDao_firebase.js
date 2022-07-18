const express = require('express');
const router = express.Router();
const colMessages = require('../containers/messagesContainer_firebase');


//Vista de todos los mensajes
router.get('/', (req, res) => {
    const getMessages = (async () => {
        const messages = await colMessages.getAll();
        res.render('main-messages', {messages});
    }) ();
});

//Para agregar un mensaje
router.post('/', (req, res) => {
    const newProduct = req.body;
    newProduct.timestamp = Date.now();
    const getProducts = (async () => {
        const newId = await colProducts.save(newProduct);
        res.send(`producto agregado, id: ${newId}`);
    }) ();
});

module.exports = router;