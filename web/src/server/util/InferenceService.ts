import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { zip } from "lodash";
import { z } from "zod";

const prisma = new PrismaClient();

export class InferenceService {
  private instance = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  async getFromCacheOrPython(
    urls: string[]
  ): Promise<{ url: string; result: string }[]> {
    console.log("inference called");
    // check existing alt
    const cachedResult = await prisma.inference.findMany({
      where: {
        url: {
          in: urls,
        },
      },
    });

    console.log("cachedResult", cachedResult);

    const cachedUrls = cachedResult.map((r) => r.url);

    const uncachedUrls = urls.filter((u) => !cachedUrls.includes(u));

    console.log("uncachedUrls", uncachedUrls);

    const rawResponse = await this.instance
      .post<unknown>("/alt", {
        urls: uncachedUrls,
      })
      .then((res) => res.data);

    const { result } = z
      .object({
        result: z.array(z.string()),
      })
      .parse(rawResponse);

    zip(uncachedUrls, result).forEach(async ([url, alt]) => {
      if (url && alt) {
        await prisma.inference.create({
          data: {
            url,
            result: alt,
          },
        });
      }
    });

    return urls.map((url) => {
      const cached = cachedResult.find((r) => r.url === url);
      return {
        url,
        result: cached?.result || result[uncachedUrls.indexOf(url)] || "",
      };
    });
  }
}
