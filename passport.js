const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const { MongoClient } = require('mongodb');
const { mongoAtlasConnection } = require('./mongoAtlasConnection');

const connectMongo = ( async () => {
    const mongo = new MongoClient(mongoAtlasConnection);
    err => {
        if (err) throw new Error('Error al conectar a Mongo Atlas');
        console.log('conectado a Mongo Atlas');
    }
    await mongo.connect();
    console.log("despues de mongo connect")


    const findUser = async (username) => {
        const user = await mongo.db("ecommerce").collection("usuarios").find({username: username}).toArray();
        console.log("user en find", user)
        return user;
    };

    const saveUser = async (username, password) => {
        await mongo.db("ecommerce").collection("usuarios").insertOne({username: username, password: password});
        const users = await mongo.db("ecommerce").collection("usuarios").find().toArray();
        console.log("supuestamente guardado nuevo usuario en save", users)
    };

    passport.use('register', new LocalStrategy( async (username, password, callback) => {
        console.log("en passport register")
        const user = await findUser(username);
        /* if (user) return callback(new Error('ya está registrado')); */
        console.log(user.length)
        if (user.length !== 0) return callback(null, false, { message: 'El usuario ya está registrado'});
        const passwordBcrypt = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        saveUser(username, passwordBcrypt);
        const nuevoUsuario = [{ username, password: passwordBcrypt }];
        console.log("nuevo usuario en passport register", nuevoUsuario)
        callback(null, nuevoUsuario);
    }));

    passport.use('login', new LocalStrategy( async (username, password, callback) => {
        const user = await findUser(username);
        console.log("user en passport login", user)
        /* if (!user) return callback(new Error('el usuario no está registrado')); */
        if (user.length === 0) return callback(null, false, { message: 'El usuario no está registrado'});
        console.log(user[0].password)
        if (!bcrypt.compareSync(password, user[0].password)) return callback(null, false, { message: 'password incorrecto'});
        callback(null, user);
    }));

    passport.serializeUser((user, callback) => {
        callback(null, user[0].username);
    });

    passport.deserializeUser((username, callback) => {
        const user = findUser(username);
        callback(null, user);
    });    
}) ();

module.exports = passport;