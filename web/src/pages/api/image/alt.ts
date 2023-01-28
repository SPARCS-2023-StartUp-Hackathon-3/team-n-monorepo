import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { z } from "zod";
import { InferenceService } from "../../../server/util/InferenceService";
import { TranslationService } from "../../../server/util/TranslationService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: { url: string; alt: string }[] }>
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const { urls, experimental } = z
    .object({
      urls: z.array(z.string()),
      experimental: z.boolean().default(false),
    })
    .parse(req.body);

  if (!experimental) {
    const response = {
      data: urls.map((u) => ({
        url: u,
        alt: "더미 데이터",
      })),
    };

    res.status(200).json(response);
    return;
  }

  const result = await new InferenceService().getAlt(urls);

  const translationService = new TranslationService();
  const response = await Promise.all(
    result.map(async (r) => ({
      url: r.url,
      alt: await translationService.enToKr(r.result),
    }))
  );

  res.status(200).json({ data: response });
}
