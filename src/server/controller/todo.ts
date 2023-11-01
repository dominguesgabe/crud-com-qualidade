import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  };
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Page must be a number",
        },
      }),
      {
        status: 400,
      }
    );
  }

  if (query.limit && isNaN(limit)) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Limit must be a number",
        },
      }),
      {
        status: 400,
      }
    );
  }

  const output = await todoRepository.get({
    page: Number(query.page),
    limit: Number(query.limit),
  });

  return new Response(
    JSON.stringify({
      total: output.total,
      pages: output.pages,
      todos: output.todos,
    }),
    {
      status: 200,
    }
  );
}

const todoCreateBodySchema = schema.object({
  content: schema.string().min(1, { message: "Required" }),
});

async function create(req: Request) {
  const body = todoCreateBodySchema.safeParse(await req.json());

  if (!body.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Todo must have content",
          description: body.error.issues,
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content);

    return new Response(
      JSON.stringify({
        todo: createdTodo,
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: error,
        },
      }),
      {
        status: 400,
      }
    );
  }
}

async function toggleDone(id: string) {
  const todoIdSchema = schema.string().uuid().safeParse(id);

  if (!todoIdSchema.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "You must provide a valid ID",
        },
      }),
      {
        status: 400,
      }
    );
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(todoIdSchema.data);
    return new Response(
      JSON.stringify({
        todo: updatedTodo,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        {
          status: error.status,
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          message: "Internal server error.",
        },
      }),
      {
        status: 500,
      }
    );
  }
}

async function deleteById(id: string) {
  const querySchema = schema.string().uuid().min(1);

  const parsedParams = querySchema.safeParse(id);

  if (!parsedParams.success) {
    return new Response(
      JSON.stringify({
        error: {
          message: "You must provide a valid ID.",
        },
      }),
      { status: 400 }
    );
  }

  try {
    const todoId = parsedParams.data;

    await todoRepository.deleteById(todoId);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return new Response(
        JSON.stringify({
          error: {
            message: error.message,
          },
        }),
        { status: error.status }
      );
    }
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
