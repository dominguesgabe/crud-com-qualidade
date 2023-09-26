import { read } from "@db-crud-todo";
import { NextApiRequest, NextApiResponse } from "next";

function get(_: NextApiRequest, res: NextApiResponse) {
  const todos = read();
  res.status(200).json({
    todos,
  });
}

export const todoController = {
  get,
};
