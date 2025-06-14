import type { Actions, PageServerLoad } from "./$types";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod/v4";
import { fail, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import { db } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { and, desc } from "drizzle-orm";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ url }) => {
  const params = new URLSearchParams(url.search);
  const creatorId = params.get("creator");

  const fields: schema.MetadataFieldWithCreator[] = await db.query.metadataFields
    .findMany({
      with: {
        creator: { columns: { passwordHash: false } },
      },
      orderBy: desc(schema.metadataFields.fieldId),
      where: creatorId ? eq(schema.metadataFields.creatorId, creatorId) : undefined,
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  const users: schema.SafeUser[] = await db.query.users
    .findMany({
      orderBy: desc(schema.users.username),
      columns: { passwordHash: false },
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  return { fields, users, params: { creatorId } };
};

const createMetadataSchema = z
  .object({
    fieldName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
    description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
    type: z.enum(["text", "boolean", "option", "number"]),
    options: z.array(z.string(), "Must have at least 2 options").default([]),
  })
  .refine((data) => (data.type === "option" ? data.options.length > 1 : true), {
    error: "Must have at least 2 options",
    path: ["options"],
  });

const updateMetadataSchema = z.object({
  fieldId: z.string().transform((value) => parseInt(value, 10)),
  fieldName: z.string().trim().min(1, "Required").max(31, "Must be 31 characters or less"),
  description: z.string().trim().max(255, "Must be 255 characters or less").default(""),
});

const deleteMetadataSchema = z.object({
  fieldId: z.string().transform((value) => parseInt(value, 10)),
});

type CreateMetadataActionReturn = ActionFailure<{
  createMetadata: {
    errorMap: {
      fieldName?: string;
      description?: string;
      type?: string;
      options?: string;
      root?: string;
    };
  };
}>;

type UpdateMetadataActionReturn = ActionFailure<{
  updateMetadata: {
    errorMap: {
      fieldName?: string;
      description?: string;
      root?: string;
    };
  };
}>;

type DeleteMetadataActionReturn = ActionFailure<{
  deleteMetadata: {
    errorMap: { root?: string };
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
      return fail(400, { createMetadata: { errorMap } });
    }

    try {
      await db.insert(schema.metadataFields).values({
        name: data.fieldName,
        description: data.description,
        config:
          data.type === "option" ? { type: data.type, options: data.options } : { type: data.type },
        creatorId: user.userId,
      });
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return fail(400, {
            createMetadata: { errorMap: { fieldName: "Field name already exists" } },
          });
        }
      }

      console.error(e);
      return fail(500, {
        createMetadata: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
  deleteMetadata: async (event): Promise<DeleteMetadataActionReturn | void> => {
    const user = requireAuthenticatedUser();
    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);
    const { data, error, success } = deleteMetadataSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});

      if (errorMap.fieldId) {
        errorMap.root = errorMap.fieldId;
        delete errorMap.fieldId;
      }

      return fail(400, { deleteMetadata: { errorMap } });
    }

    try {
      await db
        .delete(schema.metadataFields)
        .where(
          and(
            eq(schema.metadataFields.fieldId, data.fieldId),
            eq(schema.metadataFields.creatorId, user.userId),
          ),
        );
    } catch (e) {
      console.error(e);
      return fail(500, {
        deleteMetadata: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
  updateMetadata: async (event): Promise<UpdateMetadataActionReturn | void> => {
    const user = requireAuthenticatedUser();
    const formData = await event.request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = updateMetadataSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});

      if (errorMap.fieldId) {
        errorMap.root = errorMap.fieldId;
        delete errorMap.fieldId;
      }

      return fail(400, { updateMetadata: { errorMap } });
    }

    try {
      await db
        .update(schema.metadataFields)
        .set({ name: data.fieldName, description: data.description })
        .where(
          and(
            eq(schema.metadataFields.fieldId, data.fieldId),
            eq(schema.metadataFields.creatorId, user.userId),
          ),
        );
    } catch (e) {
      if (e instanceof Error && "code" in e) {
        if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return fail(400, {
            updateMetadata: { errorMap: { fieldName: "Field name already exists" } },
          });
        }
      }

      console.error(e);
      return fail(500, {
        updateMetadata: { errorMap: { root: "Something went wrong" } },
      });
    }
  },
};
