interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}
interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (response) => {
      const rawTodos = await response.text();
      const parsedResponse = parseServerTodos(JSON.parse(rawTodos));

      return {
        total: parsedResponse.total,
        pages: parsedResponse.pages,
        todos: parsedResponse.todos,
      };
    }
  );
}

export const todoRepository = {
  get,
};

interface Todo {
  id: string;
  content: string;
  date: Date;
  done: boolean;
}

function parseServerTodos(responseBody: unknown): {
  total: number;
  pages: number;
  todos: Todo[];
} {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    "total" in responseBody &&
    "pages" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== "object") {
          throw new Error("Invalid todo from API");
        }

        const { id, content, done, date } = todo as {
          id: string;
          content: string;
          done: boolean;
          date: string;
        };

        return {
          id: id,
          content: content,
          done: String(done).toLowerCase() === "true",
          date: new Date(date),
        };
      }),
    };
  }

  return {
    pages: 1,
    total: 0,
    todos: [],
  };
}
