import React, { useEffect, useRef, useState } from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { todoController } from "@ui/controller/todo";

const bg = "/bg.jpg";

interface HomeTodo {
  id: string;
  content: string;
  done: boolean;
}

export default function Home() {
  const initialLoadComplete = useRef(false);
  const [totalPages, setTotalPages] = useState(0);
  const [todos, setTodos] = useState<HomeTodo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newTodoContent, setNewTodoContent] = useState("");

  const homeTodos = todoController.filterTodosByContent<HomeTodo>(
    todos,
    search
  );

  const hasMorePages = totalPages > page;
  const hasNoTodos = homeTodos.length === 0 && !isLoading;

  useEffect(() => {
    if (!initialLoadComplete.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setTodos(todos);
          setTotalPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadComplete.current = true;
        });
    }
  }, []);

  function newTodoHandler(event: React.ChangeEvent<HTMLInputElement>) {
    setNewTodoContent(event.target.value);
  }

  return (
    <main>
      <GlobalStyles themeName="coolGrey" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newTodoContent,
              onSuccess(todo: HomeTodo) {
                setTodos((oldTodos) => {
                  return [...oldTodos, todo];
                });
              },
              onError() {
                alert("Você não pode criar uma tarefa vazia.");
              },
            });
            setNewTodoContent("");
          }}
        >
          <input
            type="text"
            onChange={newTodoHandler}
            value={newTodoContent}
            placeholder="Correr, Estudar..."
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
            placeholder="Filtrar lista atual, ex: Dentista"
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((todo) => (
              <tr key={todo.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={function handleToggle() {
                      todoController.toggleDone({
                        id: todo.id,
                        updateTodoOnScreen() {
                          setTodos((currentTodos) => {
                            return currentTodos.map((currentTodo) => {
                              if (todo.id === currentTodo.id) {
                                return {
                                  ...currentTodo,
                                  done: !currentTodo.done,
                                };
                              }

                              return currentTodo;
                            });
                          });
                        },
                        onError() {
                          alert("Falha na atualização da TODO");
                        },
                      });
                    }}
                  />
                </td>
                <td>{todo.id.substring(0, 4)}</td>
                <td>
                  {!todo.done && todo.content}
                  {todo.done && <s>{todo.content}</s>}
                </td>
                <td align="right">
                  <button
                    data-type="delete"
                    onClick={function handleClick() {
                      todoController
                        .deleteById(todo.id)
                        .then(() => {
                          setTodos((currentTodos) => {
                            return currentTodos.filter(
                              (currentTodo) => currentTodo.id !== todo.id
                            );
                          });
                        })
                        .catch(() => console.error("Failed to delete."));
                    }}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}
            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}
            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);

                      const nextPage = page + 1;
                      setPage(nextPage);

                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setTodos((oldTodos) => {
                            return [...oldTodos, ...todos];
                          });
                          setTotalPages(pages);
                        })
                        .finally(() => setIsLoading(false));
                    }}
                  >
                    Página {page}, Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
