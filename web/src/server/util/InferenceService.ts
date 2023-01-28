import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { z } from "zod";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export class InferenceService {
  private instance = axios.create({
    baseURL: "http://noon.hackathon.sparcs.org",
  });

  async getAlt(urls: string[]): Promise<{ url: string; result: string }[]> {
    console.log("inference called");

    const rawResponse = await this.instance
      .post<unknown>("/alt", {
        urls,
      })
      .then((res) => res.data);

    const { result } = z
      .object({
        result: z.array(z.string()),
      })
      .parse(rawResponse);

    return urls.map((url, i) => {
      return {
        url,
        result: result[i] || "",
      };
    });
  }
}
