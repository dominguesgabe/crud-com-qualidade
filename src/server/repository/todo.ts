import { HttpNotFoundError } from "@server/infra/errors";
import { Todo, TodoSchema } from "@server/schema/todo";

//====supabase====

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

//==========

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  total: number;
  pages: number;
  todos: Todo[];
}

async function get({
  page,
  limit,
}: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
  const currentPage = page || 1;
  const currentLimit = limit || 10;
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit - 1;

  const { data, error, count } = await supabase
    .from("Todos")
    .select("*", {
      count: "exact",
    })
    .order("date", { ascending: false })
    .range(startIndex, endIndex);

  if (error) throw new Error("Failed to fetch data.");

  const parsedData = TodoSchema.array().safeParse(data);

  if (!parsedData.success) throw parsedData.error;

  const todos = parsedData.data;
  const total = count || todos.length;
  const totalPages = Math.ceil(total / currentLimit);

  return {
    todos,
    total,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("Todos")
    .insert([
      {
        content,
      },
    ])
    .select()
    .single();

  if (error) throw new Error("Failed to create Todo.");

  const parsedData = TodoSchema.parse(data);

  return parsedData;
}

async function getTodoById(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("Todos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Failed to find Todo. with id: ${id}`);

  const parsedData = TodoSchema.safeParse(data);

  if (!parsedData.success) throw new Error(`Failed to parse. with id: ${id}`);

  return parsedData.data;
}

async function toggleDone(id: string): Promise<Todo> {
  const todo = await getTodoById(id);

  const { data, error } = await supabase
    .from("Todos")
    .update({
      done: !todo.done,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update Todo. with id: ${id}`);

  const parsedData = TodoSchema.safeParse(data);

  if (!parsedData.success) throw new Error(`Failed to parse. with id: ${id}`);

  return parsedData.data;
}

async function deleteById(id: string) {
  const { error } = await supabase.from("Todos").delete().match({
    id,
  });

  if (error)
    throw new HttpNotFoundError(`Error deleting Todo with id "${id}".`);
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};
