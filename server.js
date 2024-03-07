const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions =  {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Parse requests of content type - application/json
app.use(bodyParser.json());

//Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}));


//simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the recipe management tool"})
});

require("./app/routes/recipe.routes")(app);

//Set port, listen for requests
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`Server is runnning on port: ${PORT}.`);
});

const db = require("./app/models");
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