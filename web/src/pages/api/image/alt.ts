import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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
