const BASE_URL = "http://localhost:3000";

describe("/ - Todos Feed", () => {
  it("Should load home and render the page", () => {
    cy.visit(BASE_URL);
  });

  it("Should create a new todo, it must appear in the feed", () => {
    cy.intercept("POST", BASE_URL + "/api/todos", (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "7fccffca-a7a8-465c-9f1a-8277436885dc",
            date: "2023-10-07T14:16:27.651Z",
            content: "Ir para academia",
            done: false,
          },
        },
      });
    }).as("createTodo");

    cy.visit(BASE_URL);

    cy.get("input[name='add-todo']").as("inputAddTodo");
    cy.get("@inputAddTodo").type("Ir para academia");

    cy.get("button[aria-label='Adicionar novo item']").as("buttonAddTodo");
    cy.get("@buttonAddTodo").click();

    cy.get("table > tbody").contains("Ir para academia");
  });

  it("Should search for a specific todo on the feed", () => {
    cy.intercept("GET", BASE_URL + "/api/todos?page=1&limit=6", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          total: 4,
          pages: 1,
          todos: [
            {
              id: "34543-456345-345686-23464-234",
              date: "2023-03-27T00:41:744Z",
              content: "dormir 8h",
              done: true,
            },
            {
              id: "15675-456345-345686-23464-234",
              date: "2023-03-17T00:41:744Z",
              content: "dar banho no peixe",
              done: true,
            },
            {
              id: "34532-456345-345686-23464-234",
              date: "2023-03-27T00:41:744Z",
              content: "Programar pokedéx",
              done: false,
            },
            {
              id: "34532-456345-345686-23464-234",
              date: "2023-03-27T00:41:744Z",
              content: "tomar banho",
              done: false,
            },
          ],
        },
      });
    }).as("getAllTodos");

    cy.visit(BASE_URL);

    cy.get("input[name='search-todo']").as("inputSearchTodo");
    cy.get("@inputSearchTodo").type("banho");

    cy.get("table > tbody").contains("dar banho no peixe");
    cy.get("table > tbody").contains("tomar banho");

    cy.get("table > tbody").contains("dormir 8h").should("not.exist");
  });

  it("Should mark todo as completed", () => {
    cy.visit(BASE_URL);

    cy.intercept("GET", BASE_URL + "/api/todos?page=1&limit=6", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          total: 2,
          pages: 1,
          todos: [
            {
              id: "34543-456345-345686-23464-234",
              date: "2023-03-27T00:41:744Z",
              content: "dormir 8h",
              done: false,
            },
            {
              id: "15675-456345-345686-23464-234",
              date: "2023-03-17T00:41:744Z",
              content: "Ir para academia",
              done: false,
            },
          ],
        },
      });
    }).as("getAllTodos");

    cy.intercept(
      "PUT",
      BASE_URL + "/api/todos/34543-456345-345686-23464-234/toggle-done",
      (request) => {
        request.reply({
          statusCode: 200,
          body: {
            todo: {
              id: "36ad1891-e386-4a52-a98c-d24a5d65a83f",
              date: "2023-10-06T20:40:48.928Z",
              content: "testar",
              done: true,
            },
          },
        });
      }
    ).as("toggleDone");

    cy.get("tbody > :nth-child(1) > :nth-child(1) > input").check();
  });

  it("Should delete a todo", () => {
    cy.intercept("GET", BASE_URL + "/api/todos?page=1&limit=6", (request) => {
      request.reply({
        statusCode: 200,
        body: {
          total: 4,
          pages: 1,
          todos: [
            {
              id: "34543-456345-345686-23464-234",
              date: "2023-03-27T00:41:744Z",
              content: "dormir 8h",
              done: false,
            },
            {
              id: "15675-456345-345686-23464-234",
              date: "2023-03-17T00:41:744Z",
              content: "dar banho no peixe",
              done: false,
            },
          ],
        },
      });
    }).as("getAllTodos");

    cy.intercept(
      "DELETE",
      BASE_URL + "/api/todos/34543-456345-345686-23464-234",
      (request) => {
        request.reply({
          statusCode: 204,
        });
      }
    ).as("getAllTodos");

    cy.visit(BASE_URL);

    cy.get("table > tbody").contains("dormir 8h");

    cy.get(':nth-child(1) > [align="right"] > button').click();

    cy.get("table > tbody").contains("dormir 8h").should("not.exist");
  });
});
