require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');


const app = express();
const PORT = process.env.PORT || 7000;
// Database connectionS
mongoose.connect(process.env.URI,{ usenewurlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(session({
    secret:'my secret key ',
    saveUninitialized:true,
    resave:false,

})
);
app.use((req,res,next)=>{
    res.locals.message = req. session.message;
    delete req.session.message;
    next();

})
app.use(express.static("uploads"));
app.set('view engine','ejs')


// Route handling
app.use("",require("./routes/routes"))

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
