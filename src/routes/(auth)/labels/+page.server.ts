import type { Actions, PageServerLoad } from "./$types";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import { fail, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { desc } from "drizzle-orm";

export const load: PageServerLoad = async () => {
  const labels: schema.Label[] = await db
    .select()
    .from(schema.labels)
    .orderBy(desc(schema.labels.labelId))
    .catch(() => []);

  return { labels };
};

const createLabelSchema = z.object({
  labelName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
  description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
});

type CreateLabelActionReturn = ActionFailure<{
  createLabel: {
    errorMap: {
      labelName?: string;
      description?: string;
      root?: string;
    };
  };
}>;

type UpdateLabelActionReturn = ActionFailure<{
  updateLabel: {
    errorMap: {
      labelName?: string;
      description?: string;
      root?: string;
    };
  };
}>;

export const actions: Actions = {
  createLabel: async (event): Promise<CreateLabelActionReturn | void> => {
    const user = requireAuthenticatedUser();

    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = createLabelSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      return fail(400, { createLabel: { errorMap } });
    }

    try {
      await db.insert(schema.labels).values({
        name: data.labelName,
        description: data.description,
        creatorId: user.userId,
      });
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return fail(400, {
            createLabel: { errorMap: { labelName: "Label name already exists" } },
          });
        }
      }

      console.error(e);
      return fail(500, {
        createLabel: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
  updateLabel: async (): Promise<UpdateLabelActionReturn | void> => {
    return;
  },
};
