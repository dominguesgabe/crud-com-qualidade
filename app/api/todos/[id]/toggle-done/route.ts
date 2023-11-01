import { todoController } from "@server/controller/todo";

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  return await todoController.toggleDone(params.id);
}
