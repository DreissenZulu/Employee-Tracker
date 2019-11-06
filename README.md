# Unit 12 MySQL Employee Tracker
CLI Content Management System to manage a company's employees. The application links to an SQL database and allows users to view and manage employee records from the command line interface in a more user friendly environment.

## Approach
Backend development, especially involving databases is a new concept to me. Breaking down the project I sought to complete the following objectives:
1. Get the SQL database and return it as a table in the command line by using linkages
2. The table should have the column names: id, first_name, last_name, title, department, salary, and manager (if applicable). Therefore the tables must be linked in some way
3. Allow the user to add or delete their own employees, roles, and departments
4. Allow the user to edit employee roles

To begin the project, I created a separate sql file, seed.sql, containing sample values to test the application's functionality.

## Challenges
The challenges started right away with SQL. While joining the three tables was relatively simple, figuring out how to join a new column with the manager's name was not. I wanted to put the manager's first and last names together into one column, and I was able to include this by using the CONCAT method. I also found out I could call the employee table again by using a different variable name, and using this trick I was able to include the managers' names to the table.