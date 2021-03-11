const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(400).json({error: "User does not exists!"})
  }

  request.user = user;

  return next();

}

app.post('/users',(request, response) => {
  const {name, username} = request.body;
  const userAlreadyExists = users.some((user)=>user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists!"})
}

  const id = uuidv4();

  users.push({
    id,
    name,
    username,
    todos: [],
  });

  const user = users.find((user)=> user.id === id)

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos) 
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;


  const idTodo = uuidv4();

  const newTodo = {
    id: idTodo,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title,  deadline } = request.body;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo)=> todo.id === id);

  if (todoIndex<0) {
    return response.status(404).json({error: "ToDo does not exists!"})
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.json(user.todos[todoIndex]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo)=> todo.id === id);

  if (todoIndex<0) {
    return response.status(404).json({error: "ToDo does not exists!"})
  }

  user.todos[todoIndex].done = true;

  return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo)=> todo.id === id);

  if (todoIndex<0) {
    return response.status(404).json({error: "ToDo does not exists!"})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json({Message: "ToDo removed!"});


});

module.exports = app;