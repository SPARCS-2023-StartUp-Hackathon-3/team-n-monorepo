import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ count: number }>
) {
  const totalSubmissionCount = await prisma.user.aggregate({
    _sum: {
      submissionCount: true,
    },
  });
  res
    .status(200)
    .json({ count: totalSubmissionCount?._sum.submissionCount || 0 });
}
