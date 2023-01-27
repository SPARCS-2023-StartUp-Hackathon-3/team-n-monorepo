import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number }>
) {
  const count = 123;
  res.status(200).json({ count });
}
