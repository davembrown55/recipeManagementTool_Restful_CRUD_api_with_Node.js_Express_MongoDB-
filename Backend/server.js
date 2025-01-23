// Initialize the app
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors"); 
const session = require("express-session");
const MongoStore = require("connect-mongo");
const rateLimit = require("express-rate-limit");
const db = require("./app/models");
const helmet = require('helmet');


// Load environment variables
require('dotenv').config();

// Security-related middlewares
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"]
      }
    }
  }));

// Apply rate limiters
// Define a stricter rate limiter for login and register routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs (stricter limit for security)
    message: 'Too many attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, 
    legacyHeaders: false,
});

// Define a more relaxed rate limiter for other routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs (relaxed limit)
    standardHeaders: true, 
    legacyHeaders: false,
});

// Apply the stricter limiter to specific routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use(generalLimiter)


// CORS settings
var corsOptions =  {
    origin: "http://localhost:8081",
    credentials: true 
};

//Parse Incoming requests
app.use(cors(corsOptions));
// Parse requests of content type - application/json
app.use(bodyParser.json());
//Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}));
//Parse cookies
app.use(cookieParser());



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
        // maxAge: 1 * 30 * 1000 // 30 seconds
    }
}));

// Routes
app.use('/api/recipes', require("./app/routes/recipe.routes"));
app.use('/api/auth', require("./app/routes/auth.routes"));

//simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the recipe management tool"})
});

//Set port, and start the server
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`Server is runnning on port: ${PORT}.`);
});

// Database connection
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

