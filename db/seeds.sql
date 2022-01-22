INSERT INTO department 
  (name)
VALUES
  ('Sales'),
  ('Marketing'),
  ('IT');

INSERT INTO role 
  (title, salary, department_id)
VALUES
('Sales manager', 170000.00, 1),
('Sales rep', 100000.00, 1),
('Marketing manager', 170000.00, 2),
('Copy writer', 70000.00, 2),
('IT Manager', 170000.00, 3),
('Systems Admin', 135000.00, 3);

INSERT INTO employee 
  (first_name, last_name, role_id, manager_id)
VALUES 
  ('Piers', 'Gaveston', 1, NULL),
  ('Ronald', 'Firbank', 2, 1),
  ('Virginia', 'Woolf', 2, 1),
  ('Charles', 'LeRoi', 3, NULL),
  ('Katherine', 'Mansfield', 4, 4),
  ('Dora', 'Carrington', 4, 4),
  ('Edward', 'Bellamy', 4, 4),
  ('Montague', 'Summers', 5, NULL),
  ('Octavia', 'Butler', 6, 8),
  ('Unica', 'Zurn', 6, 8);