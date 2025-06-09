import type { Actions, PageServerLoad } from "./$types";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import { fail, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";

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

const createLabelSchema = z.object({
  labelName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
  description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
});

const updateLabelSchema = z
  .object({
    labelId: z.string().transform((value) => parseInt(value, 10)),
  })
  .extend(createLabelSchema.shape);

const deleteLabelSchema = z.object({
  labelId: z.string().transform((value) => parseInt(value, 10)),
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

type DeleteLabelActionReturn = ActionFailure<{
  deleteLabel: {
    errorMap: { root?: string };
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
  updateLabel: async (event): Promise<UpdateLabelActionReturn | void> => {
    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);
    const { data, error, success } = updateLabelSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});

      if (errorMap.labelId) {
        errorMap.root = errorMap.labelId;
        delete errorMap.labelId;
      }

      return fail(400, { updateLabel: { errorMap } });
    }

    try {
      await db
        .update(schema.labels)
        .set({
          name: data.labelName,
          description: data.description,
        })
        .where(eq(schema.labels.labelId, data.labelId));
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return fail(400, {
            updateLabel: { errorMap: { labelName: "Label name already exists" } },
          });
        }
      }

      console.error(e);
      return fail(500, {
        updateLabel: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
  deleteLabel: async (event): Promise<DeleteLabelActionReturn | void> => {
    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);
    const { data, error, success } = deleteLabelSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});

      if (errorMap.labelId) {
        errorMap.root = errorMap.labelId;
        delete errorMap.labelId;
      }

      return fail(400, { deleteLabel: { errorMap } });
    }

    try {
      await db.delete(schema.labels).where(eq(schema.labels.labelId, data.labelId));
    } catch (e) {
      console.error(e);
      return fail(500, {
        deleteLabel: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
};
