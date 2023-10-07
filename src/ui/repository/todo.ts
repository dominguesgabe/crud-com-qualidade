import { Todo, TodoSchema } from "@ui/schema/todo";
import { z as schema } from "zod";

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

async function createByContent(content: string): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (response.ok) {
    const ServerResponseSchema = schema.object({
      todo: TodoSchema,
    });

    const serverResponse = await response.json();
    const serverResponseParsed = ServerResponseSchema.safeParse(serverResponse);

    if (!serverResponseParsed.success) {
      throw new Error("Failed to create Todo.");
    }

    return serverResponseParsed.data.todo;
  }

  throw new Error("Failed to create Todo.");
}

async function toggleDone(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}/toggle-done`, {
    method: "PUT",
  });

  if (response.ok) {
    const ServerResponseSchema = schema.object({
      todo: TodoSchema,
    });

    const serverResponse = await response.json();
    const serverResponseParsed = ServerResponseSchema.safeParse(serverResponse);

    if (!serverResponseParsed.success) {
      throw new Error(`Failed to update TODO with id "${id}".`);
    }

    return serverResponseParsed.data.todo;
  }

  throw new Error("Server error");
}

async function deleteById(id: string) {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete.");
  }
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};

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
          date: date,
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
