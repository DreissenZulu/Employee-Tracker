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
    console.log(' ');
    await db.query('SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    });
};

// Called inside inquirers to check that the user isn't just trying to fill spots with empty space
async function confirmStringInput (input) {
    if ((input.trim() != "") && (input.trim().length <= 30)) {
        return true;
    }
    return "Invalid input. Please limit your input to 30 characters or less."
};

// Adds a new employee after asking for name, role, and manager
async function addEmployee() {
    let positions = await db.query('SELECT id, title FROM role');
    let managers = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
    managers.unshift({ id: null, Manager: "None" });

    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "Enter employee's first name:",
            validate: confirmStringInput
        },
        {
            name: "lastName",
            type: "input",
            message: "Enter employee's last name:",
            validate: confirmStringInput
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
    ]).then(answers => {
        let positionDetails = positions.find(obj => obj.title === answers.role);
        let manager = managers.find(obj => obj.Manager === answers.manager);
        db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)", [[answers.firstName.trim(), answers.lastName.trim(), positionDetails.id, manager.id]]);
        console.log("\x1b[32m", `${answers.firstName} was added to the employee database!`);
        runApp();
    });
};

// Removes an employee from the database
async function removeEmployee() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "employeeName",
            type: "list",
            message: "Remove which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.employeeName != "Cancel") {
            let unluckyEmployee = employees.find(obj => obj.name === response.employeeName);
            db.query("DELETE FROM employee WHERE id=?", unluckyEmployee.id);
            console.log("\x1b[32m", `${response.employeeName} was let go...`);
        }
        runApp();
    })
};

// Change the employee's manager
async function updateManager() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "For which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(employeeInfo => {
        if (employeeInfo.empName == "Cancel") {
            runApp();
            return;
        }
        let managers = employees.filter(currEmployee => currEmployee.name != employeeInfo.empName);
        for (i in managers) {
            if (managers[i].name === "Cancel") {
                managers[i].name = "None";
            }
        };

        inquirer.prompt([
            {
                name: "mgName",
                type: "list",
                message: "Change their manager to:",
                choices: managers.map(obj => obj.name)
            }
        ]).then(managerInfo => {
            let empID = employees.find(obj => obj.name === employeeInfo.empName).id
            let mgID = managers.find(obj => obj.name === managerInfo.mgName).id
            db.query("UPDATE employee SET manager_id=? WHERE id=?", [mgID, empID]);
            console.log("\x1b[32m", `${employeeInfo.empName} now reports to ${managerInfo.mgName}`);
            runApp();
        })
    })
};

async function updateRole() {
    
}

// Add a new role to the database
async function addRole() {

};

// Add a new department to the database
async function addDepartment() {

};

function editEmployeeOptions() {
    inquirer.prompt({
        name: "editChoice",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Change Employee Role",
            "Change Employee Manager",
            "Return To Main Menu"
        ]
    }).then(response => {
        switch (response.editChoice) {
            case "Change Employee Role":
                updateRole();
                break;
            case "Change Employee Manager":
                updateManager();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
}

// Main interface loop. Called after pretty much every function completes
function runApp() {
    inquirer.prompt({
        name: "mainmenu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Add A New Employee",
            "Edit Employeee Info",
            "Remove An Employee",
            "Add A New Role",
            "Add A New Department"
        ]
    }).then(responses => {
        switch (responses.mainmenu) {
            case "View All Employees":
                showEmployeeSummary();
                break;
            case "Add A New Employee":
                addEmployee();
                break;
            case "Edit Employeee Info":
                editEmployeeOptions();
                break;
            case "Remove An Employee":
                removeEmployee();
                break;
            case "Add A New Role":
                addRole();
                break;
            case "Add A New Department":
                addDepartment();
                break;
        }
    });
}

console.log("_______  __   __  _______    _______  ______    _______  _______  ___   _  _______  ______\n|       ||  |_|  ||       |  |       ||    _ |  |   _   ||       ||   | | ||       ||    _ |\n|       ||       ||  _____|  |_     _||   | ||  |  |_|  ||       ||   |_| ||    ___||   | ||\n|       ||       || |_____     |   |  |   |_||_ |       ||       ||      _||   |___ |   |_||_ \n|      _||       ||_____  |    |   |  |    __  ||       ||      _||     |_ |    ___||    __  |\n|     |_ | ||_|| | _____| |    |   |  |   |  | ||   _   ||     |_ |    _  ||   |___ |   |  | |\n|_______||_|   |_||_______|    |___|  |___|  |_||__| |__||_______||___| |_||_______||___|  |_|\n\nVersion Incomplete\n");

runApp();

// async function testFunc() {
//     let employees = await db.query('SELECT * FROM employee');
//     console.log(employees);
// }

// testFunc();