const inquirer = require('inquirer');
// const mysql = require('mysql2');
const db = require('./db/connection');

db.connect((err) => {
  if (err) throw err;
  newPrompt();
})

const newPrompt = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select one of the following options:',
      choices:
        [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
    }
  ])
  switch (action) {
    case 'View all departments':
      const deptQuery = `SELECT * FROM department ORDER BY id`;
      const depts = await db.promise().query(deptQuery)
      console.table(depts[0]);
      newPrompt();
      break;
    //refactor to async/await from here down
    case 'View all roles':
      const roleQuery = `
      SELECT
        role.id,
        role.title,
        department.name as Department
      FROM role
      LEFT JOIN department 
      ON department_id = department.id
      ORDER BY Department;
      `;
      const roles = await db.promise().query(roleQuery)
      console.table(roles[0]);
      newPrompt();
      break;
    case 'View all employees':
      const employeeQuery = `
      SELECT
        employee.id AS 'Employee ID',
        employee.first_name AS 'First Name', 
        employee.last_name AS 'Last Name', 
        role.title as Title,
        department.name as Department,
        role.salary as Salary,
        CONCAT(m.first_name, ' ', m.last_name) as Manager
      FROM employee
      LEFT JOIN role
      ON role_id = role.id
      LEFT JOIN department
      ON role.department_id = department.id
      LEFT JOIN employee AS m
      ON employee.manager_id = m.id
      ORDER BY employee.last_name;
      `;
      const employeeList = await db.promise().query(employeeQuery)
      console.table(employeeList[0]);
      newPrompt();
      break;
    case 'Add a department':
      addDepartment();
      break;
    case 'Add a role':
      addRole();
      break;
    case 'Add an employee':
      addEmployee();
      break;
    case 'Exit':
      db.end();
      break;
  }
};

//declare this an async function
const addRole = async () => {
  //this is where you tell the function to await a returned promise() from mysql2 
  // it will store the output from your query, in the case a list of departments for the usre to choose from
  const deptOptions = await db.promise().query('SELECT name, id FROM department')
  //with the inquirerList, you're remapping the deptOptions array so that the 
  //key value pair identifiers are name and value, which is what a list type prompt requires in inquirer
  //***this is just remapping so you don't need to use await***
  const inquirerList = deptOptions[0].map((dept) => ({ name: dept.name, value: dept.id }));
  //this constant will store the inquirer.prompt user input, it is waiting for input, so you use await again
  const userData = await inquirer.prompt([
    {
      type: 'input',
      //'name' key pair's value should match column/field name in schema so you don't have to remap it later in function
      name: 'title',
      message: "What is the Role's title?"
    },
    {
      type: 'input',
      name: 'Salary',
      message: 'What is the Salary?'
    },
    {
      type: "list",
      name: "department_id",
      message: "What is the department of the role?",
      //this will create a list of departments for the user to choose from
      choices: inquirerList
    }
  ])
  //this will insert the users answers into the table. As long as the 'name' values of the prompt options 
  //match comlumn names no additional changes are needed
  const newRole = await db.promise().query('INSERT INTO role set ?', userData);
  // call the original prompts so the user can go through and decide what to do.
  newPrompt();
};

const addEmployee = async () => {
  const managerOptions = await db.promise().query(`SELECT CONCAT(first_name, ' ', last_name) as full_name, id FROM employee`)
  const managerList = managerOptions[0].map((manager) => ({ name: manager.full_name, value: manager.id }));
  const roleOptions = await db.promise().query('SELECT title, id FROM role')
  const roleList = roleOptions[0].map((role) => ({ name: role.title, value: role.id }));
  const userData = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'What is employees first name?'
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'What is employees last name?'
    },
    {
      type: "list",
      name: "role_id",
      message: "Please select the employee's role:",
      choices: roleList
    },
    {
      type: "list",
      name: "manager_id",
      message: "Please select the employee's manager:",
      choices: managerList
    }
  ])
  const newRole = await db.promise().query('INSERT INTO employee set ?', userData);
  newPrompt();
};


const addDepartment = async () => {
  const userData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of Department?',
      //add validation
      validate: 
    }
  ])
  const newDept = await db.promise().query('INSERT INTO department set ?', userData);
  newPrompt();
};