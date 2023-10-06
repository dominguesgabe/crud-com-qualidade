import { todoRepository } from "@ui/repository/todo";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (todo: any) => void;
}

async function create({
  content,
  onSuccess,
  onError,
}: TodoControllerCreateParams) {
  if (!content) {
    onError();
    return;
  }

  const todo = {
    id: "1",
    content,
    date: new Date(),
    done: false,
  };

  onSuccess(todo);
}

export const todoController = {
  get,
  create,
  filterTodosByContent,
};
