import { todoController } from "@server/controller/todo";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  return await todoController.deleteById(params.id);
}
