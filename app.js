const express = require("express");
const sql = require("mysql");

const app = express();
const port = process.env.port || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
