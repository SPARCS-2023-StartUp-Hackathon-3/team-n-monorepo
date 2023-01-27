import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const urls = req.body.urls as string[];
  const response = {
    data: urls.map((u) => ({
      url: u,
      alt: "더미 데이터",
    })),
  };

  res.status(200).json(response);
}
