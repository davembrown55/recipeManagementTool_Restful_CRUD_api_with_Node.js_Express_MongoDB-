const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const rateLimit = require("express-rate-limit");

const app = express();
require('dotenv').config();
const db = require("./app/models");
const helmet = require('helmet');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: true, 
	legacyHeaders: true, 
	
})
app.use(limiter)

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"]
      }
    }
  }));

var corsOptions =  {
    origin: "http://localhost:8081",
    credentials: true 
};

app.use(cors(corsOptions));
// Parse requests of content type - application/json
app.use(bodyParser.json());
//Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}));
//Parse cookies
app.use(cookieParser());

// Content Security Policy (CSP) // handled with helmet, as above
// app.use((req, res, next) => {
//     res.setHeader(
//       "Content-Security-Policy",
//       "default-src 'self'; script-src 'self';"
//     );
//     next();
// });

// Session storage
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({ mongoUrl: 'mongodb://localhost/recipe_app' }), // Session storage in MongoDB
    store: MongoStore.create({ mongoUrl: db.url }),
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 60 * 60 * 1000 // 1-hour session expiry
    }
}));


//simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the recipe management tool"})
});

require("./app/routes/recipe.routes")(app);
 
app.use('/api/auth', require("./app/routes/auth.routes"));

//Set port, listen for requests
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`Server is runnning on port: ${PORT}.`);
});

db.mongoose
    .connect(db.url, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch(err => {
        console.log("Can not connect to the database!", err);
        process.exit();
    });

