const express = require('express');
const app= express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(express.json());
var util= require('util');
var encoder = new util.TextEncoder('utf-8');
//db
require('./db/conn');
//routing
app.use(require('./router/auth'));
//models

const User = require('./model/userSchema');



app.listen(3000, ()=>{
    console.log("Server listening at port 3000");
})