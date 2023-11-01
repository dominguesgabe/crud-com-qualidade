import { todoController } from "@server/controller/todo";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   request: NextApiRequest,
//   response: NextApiResponse
// ) {
//   if (request.method === "GET") {
//     await todoController.get(request, response);
//     return;
//   }

//   if (request.method === "POST") {
//     await todoController.create(request, response);
//     return;
//   }

//   response.status(405).json({
//     status: "method not allowed",
//   });
// }

export async function GET(request: Request) {
  return await todoController.get(request);
}

export async function POST(request: Request) {
  return await todoController.create(request);
}
