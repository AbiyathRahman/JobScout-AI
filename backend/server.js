const express = require('express');
require('dotenv').config({ path: './config.env'});
const session = require('express-session');
const app = express();
const port = process.env.PORT || 4000;
const cors = require('cors');
const MongoStore = require('connect-mongo');
const dbo = require('./db/conn');
// routes
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const homeRoute = require('./routes/home');
const analyzeRoute = require('./routes/analyze');
app.use(cors(
    {
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials:true,
        optionsSuccessStatus: 204,
        allowedHeaders: ["Content-Type", "Authorization"],

    }
));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
        mongoUrl: process.env.ATLAS_URI
    })
}));
app.use(express.json());
app.use('/', registerRoutes);
app.use('/', loginRoutes);
app.use('/', homeRoute);
app.use('/', analyzeRoute);
app.get('/', (req, res) => {
    res.send("Hello World");
});


app.listen(port, () => {
    dbo.connectToServer(function(err){
        if(err){
            console.log(err);
        }
    })
    console.log(`Server is running on ${port}`);
})