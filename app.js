const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = require('./db/connection');

db.connect((err) => {
  if (err) throw err;
  newPrompt();
  // promptUser();
})

const newPrompt = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
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
      var sql = `SELECT * FROM department`;
      const rows = await db.promise().query(sql)
      console.log('========Departments========');
      console.table(rows[0]);
      newPrompt();
      break;
    case 'View all roles':
      var sql = `
      SELECT
        role.id,
        role.title,
        department.name as Department
      FROM role
      LEFT JOIN department 
      ON department_id = department.id;
      `;
      db.query(sql, (err, rows) => {
        if (err) {
          console.log(err);
        }
        console.log('==========Roles===========');
        console.table(rows);
        newPrompt();
      });
      break;
    case 'View all employees':
      var sql = `SELECT * FROM employee`;
      db.query(sql, (err, rows) => {
        if (err) {
          console.log(err);
        }
        console.log('========Employees========');
        console.table(rows);
        newPrompt();
      });
      break;
    case 'Add a department':
      addDepartment();
      break;
    case 'Add a role':
      addRole();
      break;
    case 'Exit':
      db.end();
      break;
  }
};

const promptUser = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      },
    ])
    .then(async (response) => {
      const { action } = response;
      console.log(action);
      switch (action) {
        case 'View all departments':
          var sql = `SELECT * FROM department`;
          const rows = await db.promise().query(sql)
          console.log('========Departments========');
          console.table(rows[0]);
          promptUser();
          break;
        case 'View all roles':
          var sql = `
        SELECT
          role.id,
          role.title,
          department.name as Department
        FROM role
        LEFT JOIN department 
        ON department_id = department.id;
        `;
          db.query(sql, (err, rows) => {
            if (err) {
              console.log(err);
            }
            console.log('==========Roles===========');
            console.table(rows);
            promptUser();
          });
          break;
        case 'View all employees':
          var sql = `SELECT * FROM employee`;
          db.query(sql, (err, rows) => {
            if (err) {
              console.log(err);
            }
            console.log('========Employees========');
            console.table(rows);
            promptUser();
          });
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Exit':
          db.end();
          break;
      }
    })
};

//example from office hours

// const mainPrompt = async () => {
//   const userPrompt = await inquirer.prompt([
//     {
//       type: "input",
//       name: "title",
//       message: "What is the role name"
//     },
//     {
//       type: "input",
//       name: "salary",
//       message: "What is the role salary?"
//     }
//   ])
//   //if the name from prompt same as schema
//   const res = db.promise().query('insert into role set?', userPrompt )
//   //if the name from prompt is not same as schema db
//   const res = db.promise().query('insert into role set?', {title: userPrompt.name} )
// }

// function addEmployee() {
//   db.query(sql, (err, res) => {
//     const rolesList = res.map( role => ({name: role.title, value:role.id}) )
//   }

// async function addRole() {
//   const deptList = await db.promise().query()('SELECT name, id FROM department');
//   const inquirerList = deptList[0].map((dept) => ({ name: dept.name, value: dept.id }));
//   const { roleName, roleSalary, roleDepartment } = await inquirer.prompt([
//     {
//       type: "input",
//       name: "roleName",
//       message: "What is the name of the Role"
//     },
//     {
//       type: "list",
//       name: "roleSalary",
//       message: "What is the Salary"
//     },
//     {
//       type: "list",
//       name: "roleDepartment",
//       message: "What is the department of the role?",
//       choices: inquirerList
//     }
//   ]);
//   const roleQuery = await db.promise().query(
//     "INSERT INTO role (name, salary, dept_id) VLAUES (?, ?, ?)",
//     [roleName, roleSalary, roleDepartment]
//   );
//   promptUser();
// };

// const addRole = () => {
//   db.query('select * from departments', (err, res) => {
//     inquierer.prompt().then((userInput) => {
//       db.query('insert into role set ?', {title: userInput.title}, (err, row) => {
//     })
//   })
// };

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
      message: 'What is the role title?'
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
  const deptOptions = await db.promise().query('SELECT name, id FROM department')
  //as part of inquirerList, you have to 
  const inquirerList = deptOptions[0].map((dept) => ({ name: dept.name, value: dept.id }));
  const userData = await inquirer.prompt([
    {
      type: 'input',
      //'name' value should match column/field name in schema so you don't have to remap it later in function
      name: 'title',
      message: 'What is the role title?'
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
      choices: inquirerList 
    }
  ])
  //the userData is the object created by the inquirer prompts. We have set it up with the names to match the field names so that it is properly formated
  const newRole = await db.promise().query('INSERT INTO role set ?', userData);
  // promptUser();
  newPrompt();
};


const addDepartment = async () => {
  const userData = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of Department?'
    }
  ])
  const newDept = await db.promise().query('INSERT INTO department set ?', userData);
  // promptUser();
  newPrompt();
};