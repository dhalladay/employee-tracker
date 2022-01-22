const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./db/connection');

inquirer
  .prompt([
    {
      type: 'rawlist',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all Employees', 
        'View employees by Department',
        'Nothing'
      ]
    },
  ])
  .then((value) => {
    console.log(value);
    if (option === 'View all Employees') {
      db.query(`SELECT * FROM employee`, (err, rows) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(rows);
      });
      }
    });
