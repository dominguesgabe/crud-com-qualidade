async function get() {
  return fetch("/api/todos").then(async (response) => {
    const rawTodos = await response.text();
    const serverTodos = JSON.parse(rawTodos).todos;

    return serverTodos;
  });
}

export const todoController = {
  get,
};
