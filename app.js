const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bAVqss3GpRKQ",
    database: "employeeDB"
});

async function showEmployeeSummary() {
    await db.query('SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    });
}

async function addEmployee() {
    let positions = await db.query('SELECT id, title FROM role');
    let managers = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
    managers.unshift({id: null, Manager: "None"});

    inquirer
        .prompt([{
            name: "firstName",
            type: "input",
            message: "Enter employee's first name:"
        },
        {
            name: "lastName",
            type: "input",
            message: "Enter employee's last name:"
        },
        {
            name: "role",
            type: "list",
            message: "Choose employee role:",
            choices: positions.map(obj => obj.title)
        },
        {
            name: "manager",
            type: "list",
            message: "Choose the employee's manager:",
            choices: managers.map(obj => obj.Manager)
        }
        ]).then((answers) => {
            let positionDetails = positions.find(obj => obj.title === answers.role);
            let manager = managers.find(obj => obj.Manager === answers.manager);
            db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)",
            [[answers.firstName, answers.lastName, positionDetails.id, manager.id]]);
            console.log(`${answers.firstName} was added to the employee database!`);
            runApp();
        });
}

function runApp() {
    inquirer
        .prompt({
            name: "mainmenu",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "Add A New Employee",
                "Update Employee Info",
                "Remove An Employee",
                "Add A New Role",
                "Add A New Department"
            ]
        }).then((responses) => {
            switch (responses.mainmenu) {
                case "View All Employees":
                    showEmployeeSummary();
                    break;
                case "Add A New Employee":
                    addEmployee();
                    break;
                case "Update Employee Info":
                    break;
                case "Remove An Employee":
                    break;
                case "Add A New Role":
                    break;
                case "Add A New Department":
                    break;
            }
        });
}

runApp();

// async function testFunc() {
//     let employees = await db.query('SELECT * FROM employee');
//     console.log(employees);
// }

// testFunc();