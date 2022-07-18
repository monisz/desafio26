const express = require('express');
const { engine } = require('express-handlebars');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const session = require('express-session');
/* const cookieParser = require('cookie-parser'); */
const MongoStore = require('connect-mongo');
const { mongoAtlasConnection } = require('./mongoAtlasConnection');
const passport = require('./passport');

const apiRoutes = require('./src/routes')
const tableProducts = require('./src/containers/productContainer_mysql');
const colMessages = require('./src/containers/messagesContainer_firebase');

const app = express();
const httpServer = new HttpServer(app);
const ioServer = new SocketServer(httpServer);

/* app.use(cookieParser()); */
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    store: MongoStore.create({
        mongoUrl: mongoAtlasConnection,
        dbName: 'ecommerce',
        //Según la docu, si la cookie tiene seteado el tiempo, usa ese
        ttl: 10 * 60,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }),
    secret: 'desafio26',
    resave: true,
    rolling: true,
    /* cookie: { */
    /*     maxAge: 60000 */
    /* }, */
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'index.hbs',
    })
);

app.set('views', './public/views');
app.set('view engine', 'hbs');

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', passport.authenticate('register', {failureRedirect: '/login', failureMessage: true}), (req, res) => {
    console.log("en post register")
    const registerSuccess = 'Registrado exitosamente. Ir a Login para ingresar'
    res.render('register', {registerSuccess});
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('login', {failureRedirect: '/register', failureMessage: true}), (req, res) => {
    console.log("en post login")
    const { username, password } = req.body;
    req.session.username = username;
    res.render('main-products',  {username});
});

//Chequea si ya está logueado
/* app.use('/', (req, res, next) => { */
/*     if (!req.session.userName) { */
/*         res.render('login'); */
/*     } else next(); */
/* }); */

//Lo pasé acá para que el chequeo de logueado afecte también a estas rutas
app.use('/', apiRoutes);


app.post('/logout', async (req, res) => {
    const username = req.session.username;
    req.session.destroy((err) => {
        console.log(err);
        res.render('logout', {username})
    });
});

//Ruta para test con Faker
app.get('/api/productos-test', async (req, res) => {
    const mocks = await tableProducts.generateMock();
    console.log(mocks)
    res.render('main-faker', {mocks})
});

// Para cualquier ruta no implementada
app.use((req, res) => {
    res.status(404).send("ruta no implementada");
});


httpServer.listen(8080, () => {
    console.log("escuchando desafio 26");
});


ioServer.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    const getTables = (async () => {
        socket.emit('messages', await colMessages.getAll());  
        socket.emit('products', await tableProducts.getAll());
    }) ();

    socket.on("newMessage", (message) => {
        const saveMessage = (async (message) => {
            const messagesNorm = await colMessages.save(message);
            ioServer.sockets.emit("messages", messagesNorm);
        }) (message);
    });
    socket.on('newProduct', (product) => {
        const getProducts = (async (product) => {
            await tableProducts.save(product);
            const allProducts = await tableProducts.getAll()
            ioServer.sockets.emit("products", allProducts);
        }) (product);
    });
});
