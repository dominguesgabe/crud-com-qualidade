export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: "olá mundão" }), {
    status: 200,
  });
}

/*
  import { NextApiRequest, NextApiResponse } from "next";

  export default function handler(
    request: NextApiRequest,
    response: NextApiResponse
  ) {
    response.status(200).json({ message: "olá mundão" });
  }
*/
