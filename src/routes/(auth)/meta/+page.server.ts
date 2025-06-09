import type { Actions, PageServerLoad } from "./$types";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import { fail, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { desc } from "drizzle-orm";

export const load: PageServerLoad = async () => {
  const user = requireAuthenticatedUser();

  const labels: schema.LabelWithCreator[] = await db.query.labels
    .findMany({
      with: {
        creator: { columns: { passwordHash: false } },
      },
      orderBy: desc(schema.labels.labelId),
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  return { labels, user };
};

const createMetadataSchema = z.object({
  fieldName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
  description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
  type: z.string().trim().min(1, "Required"),
});

type CreateMetadataActionReturn = ActionFailure<{
  createMetadata: {
    errorMap: {
      fieldName?: string;
      description?: string;
      type?: string;
      root?: string;
    };
  };
}>;

export const actions: Actions = {
  createMetadata: async (event): Promise<CreateMetadataActionReturn | void> => {
    const user = requireAuthenticatedUser();

    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = createMetadataSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      console.log(errorMap);
      return fail(400, { createMetadata: { errorMap } });
    }

    console.log(data);

    // try {
    //   await db.insert(schema.labels).values({
    //     name: data.fieldName,
    //     description: data.description,
    //     creatorId: user.userId,
    //   });
    // } catch (e) {
    //   console.error(e);
    //   return fail(500, {
    //     createMetadata: { errorMap: { root: "Something went wrong" } },
    //   });
    // }
  },
};
