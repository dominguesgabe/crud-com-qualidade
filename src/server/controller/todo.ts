import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    res.status(400).json({
      error: {
        message: "Page must be a number",
      },
    });
    return;
  }

  if (query.limit && isNaN(limit)) {
    res.status(400).json({
      error: {
        message: "Limit must be a number",
      },
    });
    return;
  }

  const output = await todoRepository.get({
    page: Number(query.page),
    limit: Number(query.limit),
  });
  res.status(200).json(output);
}

const todoCreateBodySchema = schema.object({
  content: schema.string().min(1, { message: "Required" }),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
  const body = todoCreateBodySchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).json({
      error: {
        message: "Todo must have content",
        description: body.error.issues,
      },
    });
    return;
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content);

    res.status(201).json({
      todo: createdTodo,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        message: error,
      },
    });
  }
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
  const todoIdSchema = schema.string().uuid().safeParse(req.query.id);
  // const todoId = req.query.id;

  if (!todoIdSchema.success) {
    res.status(400).json({
      error: {
        message: "You must provide a valid ID",
      },
    });
    return;
  }

  try {
    const updatedTodo = await todoRepository.toggleDone(todoIdSchema.data);

    res.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      res.status(error.status).json({
        error: {
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        message: "Internal server error.",
      },
    });
  }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
  const querySchema = schema.object({
    id: schema.string().uuid().min(1),
  });

  const parsedParams = querySchema.safeParse(req.query);

  if (!parsedParams.success) {
    return res.status(400).json({
      error: {
        message: "You must provide a valid ID.",
      },
    });
  }

  try {
    const todoId = parsedParams.data.id;

    await todoRepository.deleteById(todoId);
    return res.status(204).end();
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return res.status(error.status).json({
        error: {
          message: error.message,
        },
      });
    }
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
};
