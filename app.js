const express = require("express");
const sql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const app = express();
const port = process.env.port || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("*", (req, res) => {
    res.send(`Successful get to wildcard`);
})

app.listen(port, () => {
    console.log(`Now listening to port ${port}.`)
})