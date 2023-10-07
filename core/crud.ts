import fs from "fs";
import { v4 as uuid } from "uuid";

const DB_PATH = "./core/db";

type UUID = string;

interface Todo {
  date: string;
  content: string;
  done: boolean;
  id: UUID;
}

export function create(content: string): Todo {
  const todo: Todo = {
    id: uuid(),
    date: new Date().toISOString(),
    content: content,
    done: false,
  };

  const todos: Todo[] = [...read(), todo];

  fs.writeFileSync(DB_PATH, JSON.stringify({ todos }, null, 2));
  return todo;
}

export function read(): Array<Todo> {
  const dbString = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(dbString || "{}");
  if (!db.todos) {
    return [];
  }

  return db.todos;
}

export function update(id: UUID, partialTodo: Partial<Todo>): Todo {
  let updatedTodo;
  const todos = read();
  todos.forEach((currentTodo) => {
    const isToUpdate = currentTodo.id === id;
    if (isToUpdate) {
      updatedTodo = Object.assign(currentTodo, partialTodo);
    }
  });

  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      {
        todos,
      },
      null,
      2
    )
  );

  if (!updatedTodo) {
    throw new Error("Please, provide another ID!");
  }

  return updatedTodo;
}

export function deleteById(id: UUID) {
  const todos: Todo[] = read();

  const filteredTodos: Todo[] = todos.filter((todo) => id !== todo.id);

  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      {
        todos: filteredTodos,
      },
      null,
      2
    )
  );
}
