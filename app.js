const inquirer = require('inquirer');
// const mysql = require('mysql2');
const db = require('./db/connection');

//connect to db using mysql
db.connect((err) => {
  if (err) throw err;
  newPrompt();
})

//main menu questions as well as navigation based on choices
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
      //query for everything from deptartment table
      const deptQuery = `SELECT * FROM department ORDER BY id`;
      const depts = await db.promise().query(deptQuery)
      console.table(depts[0]);
      newPrompt();
      break;
    case 'View all roles':
      //pull id and title from role table, join to dept table to get dept name
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
      //three joins, one to role table to get the employee's title and salary, one to dept table to get their dept name
      //and the final join to the same employee table to get the name of the employee's manager
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
    case 'Update an employee role':
      updateRole();
      break;
    case 'Exit':
      //end connection
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
      message: "What is the Role's title?",
      validate: titleInput => {
        if (titleInput) {
          return true;
        } else {
          console.log('Enter the title of the new role');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'Salary',
      message: 'What is the Salary?',
      validate: salaryInput => {
        if (salaryInput) {
          return true;
        } else {
          console.log('Please enter the role salary');
          return false;
        }
      }
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
      message: 'What is employees first name?',
      validate: firstInput => {
        if (firstInput) {
          return true;
        } else {
          console.log('Enter the first name of the new employee.');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'What is employees last name?',
      validate: lastInput => {
        if (lastInput) {
          return true;
        } else {
          console.log('Enter the last name of the new employee.');
          return false;
        }
      }
    },
    {
      type: "list",
      name: "role_id",
      message: "Please select the employee's role:",
      choices: roleList
    },
    {
      type: "confirm",
      name: "manager_confirm",
      message: "Does this employee have a manager?",
      default: true
    },
    {
      type: "list",
      name: "manager_id",
      message: "Please select the employee's manager:",
      choices: managerList,
      when: ({ manager_confirm }) => manager_confirm
    }
  ])
  delete userData.manager_confirm;
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
      validate: nameInput => {
        if (nameInput) {
          return true;
        } else {
          console.log('You must enter the name of the new department.');
          return false;
        }
      }
    }
  ])
  const newDept = await db.promise().query('INSERT INTO department set ?', userData);
  newPrompt();
};

const updateRole = async () => {
  const employeeSQL = await db.promise().query(`SELECT CONCAT(first_name, ' ', last_name) as full_name, id FROM employee ORDER BY full_name`)
  const employeeList = employeeSQL[0].map((emp) => ({ name: emp.full_name, value: emp.id }));
  const roleOptions = await db.promise().query('SELECT title, id FROM role')
  const roleList = roleOptions[0].map((role) => ({ name: role.title, value: role.id }));
  const userData = await inquirer.prompt([
    {
      type: 'list',
      name: 'id',
      message: "Which employee's role would you like to update?",
      choices: employeeList
    }, 
    {
      type: 'list',
      name: 'role_id',
      message: "Choose the employee's new role:",
      choices: roleList
    }
  ])
  const updatedTitle = await db.promise().query(`UPDATE employee SET role_id = ${userData.role_id} WHERE id = ${userData.id}`);
  newPrompt();
};