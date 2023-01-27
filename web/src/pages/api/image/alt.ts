import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const body = z
    .object({
      urls: z.array(z.string()),
    })
    .parse(req.body);
  const response = {
    data: body.urls.map((u) => ({
      url: u,
      alt: "더미 데이터",
    })),
  };

  res.status(200).json(response);
}
