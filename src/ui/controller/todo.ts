import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoControllerGetParams {
  page: number;
}

async function get(params: TodoControllerGetParams) {
  return todoRepository.get({ page: params.page, limit: 2 });
}

function filterTodosByContent<Todo>(
  todos: Array<Todo & { content: string }>,
  search: string
): Todo[] {
  return todos.filter((todo) => {
    const searchNormalized = search.toLowerCase();
    const todoNormalized = todo.content.toLowerCase();
    return todoNormalized.includes(searchNormalized);
  });
}

interface TodoControllerCreateParams {
  content?: string;
  onError: () => void;
  onSuccess: (todo: Todo) => void;
}

async function create({
  content,
  onSuccess,
  onError,
}: TodoControllerCreateParams) {
  const parsedParams = schema.string().min(1).safeParse(content);

  if (!parsedParams.success) {
    onError();
    return;
  }

  todoRepository
    .createByContent(parsedParams.data)
    .then((newTodo) => onSuccess(newTodo))
    .catch(() => onError());
}

interface TodoControllerToggleDoneParams {
  id: string;
  updateTodoOnScreen: () => void;
  onError: () => void;
}

function toggleDone({
  id,
  updateTodoOnScreen,
  onError,
}: TodoControllerToggleDoneParams): void {
  todoRepository
    .toggleDone(id)
    .then(() => {
      updateTodoOnScreen();
    })
    .catch(() => {
      onError();
    });
}

export const todoController = {
  get,
  create,
  filterTodosByContent,
  toggleDone,
};
