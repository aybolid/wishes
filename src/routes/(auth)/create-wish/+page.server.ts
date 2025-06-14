import { db } from "$lib/server/db";
import { desc } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import * as schema from "$lib/server/db/schema";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod";
import { fail, redirect, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";

export const load: PageServerLoad = async () => {
  const labels: schema.Label[] = await db.query.labels
    .findMany({
      orderBy: desc(schema.labels.labelId),
    })
    .catch(() => []);

  const metadata: schema.MetadataField[] = await db.query.metadataFields
    .findMany({
      orderBy: desc(schema.metadataFields.fieldId),
    })
    .catch(() => []);

  return {
    labels,
    metadata,
  };
};

const createWishSchema = z
  .object({
    wishName: z.string().min(1, "Name is required").max(31, "Must be 31 characters or less"),
    url: z.string().url("Invalid URL"),
    description: z.string().max(255, "Must be 255 characters or less"),
    labels: z
      .array(z.string())
      .or(z.string())
      .optional()
      .transform((v) => (typeof v === "string" ? [parseInt(v)] : v?.map((v) => parseInt(v)))),
  })
  .catchall(z.any())
  .superRefine((data, ctx) => {
    Object.entries(data).forEach(([key, value]) => {
      if (!key.startsWith("meta_")) return;
      if (typeof value !== "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a string",
          path: [key],
        });
      } else {
        if (value.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must not be empty",
            path: [key],
          });
        }
      }
    });
  });

type CreateWishActionReturn = ActionFailure<{
  createWish: {
    errorMap: {
      wishName?: string;
      url?: string;
      description?: string;
      labels?: string;
      root?: string;
    } & Record<string, string | undefined>;
  };
}>;

export const actions: Actions = {
  default: async ({ request }): Promise<CreateWishActionReturn | void> => {
    const user = requireAuthenticatedUser();

    const formData = await request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = createWishSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      console.log(errorMap);
      return fail(400, { createWish: { errorMap } });
    }

    const { description, labels, url, wishName, ...meta } = data;

    try {
      const [createdWish] = await db
        .insert(schema.wishes)
        .values({
          name: wishName,
          url,
          description,
          creatorId: user.userId,
        })
        .returning();

      if (labels?.length) {
        await db
          .insert(schema.wishesToLabels)
          .values(labels.map((labelId) => ({ wishId: createdWish.wishId, labelId })));
      }

      if (Object.keys(meta).length) {
        await db.insert(schema.metadataValues).values(
          Object.entries(meta).map(([key, value]) => {
            const metadataFieldId = parseInt(key.replace("meta_", ""));
            return {
              wishId: createdWish.wishId,
              value,
              metadataFieldId,
            };
          }),
        );
      }
    } catch (e) {
      console.error(e);
      return fail(500, { createWish: { errorMap: { root: "Something went wrong" } } });
    }

    return redirect(302, "/");
  },
};
