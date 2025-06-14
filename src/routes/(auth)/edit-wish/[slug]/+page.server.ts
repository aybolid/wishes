import { db } from "$lib/server/db";
import { desc, eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import * as schema from "$lib/server/db/schema";
import { formDataToObject } from "$lib/utils/forms";
import { z } from "zod";
import { fail, redirect, type ActionFailure } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import { and } from "drizzle-orm";
import { inArray } from "drizzle-orm";

export const load: PageServerLoad = async ({ params }) => {
  const wishId = parseInt(params.slug);

  const wish = await db.query.wishes.findFirst({
    where: eq(schema.wishes.wishId, wishId),
    with: {
      labels: true,
      metadataValues: {
        with: { metadataField: true },
      },
    },
  });

  if (!wish) {
    throw new Error("Wish not found");
  }

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
    wish,
    labels,
    metadata,
  };
};

const updateWishSchema = z
  .object({
    wishId: z.string().transform((v) => parseInt(v)),
    wishName: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(31, "Must be 31 characters or less")
      .optional(),
    url: z.string().trim().url("Invalid URL").optional(),
    description: z.string().trim().max(255, "Must be 255 characters or less").optional(),
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

const deleteWishSchema = z.object({
  wishId: z.string().transform((v) => parseInt(v)),
});

type UpdateWishActionReturn = ActionFailure<{
  updateWish: {
    errorMap: {
      url?: string;
      description?: string;
      labels?: string;
      root?: string;
    } & Record<string, string | undefined>;
  };
}>;

type DeleteWishActionReturn = ActionFailure<{
  deleteWish: {
    errorMap: {
      root?: string;
    };
  };
}>;

export const actions: Actions = {
  updateWish: async ({ request }): Promise<UpdateWishActionReturn | void> => {
    const user = requireAuthenticatedUser();
    const formData = await request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = updateWishSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      if (errorMap.wishId) {
        errorMap.root = errorMap.wishId;
        delete errorMap.wishId;
      }
      return fail(400, { updateWish: { errorMap } });
    }

    const { wishId, description, labels, url, wishName, ...meta } = data;

    try {
      const existingWish = await db
        .select()
        .from(schema.wishes)
        .where(and(eq(schema.wishes.wishId, wishId), eq(schema.wishes.creatorId, user.userId)))
        .limit(1);

      if (!existingWish.length) {
        return fail(404, { updateWish: { errorMap: { root: "Wish not found" } } });
      }

      const existingLabels = await db
        .select({ labelId: schema.wishesToLabels.labelId })
        .from(schema.wishesToLabels)
        .where(eq(schema.wishesToLabels.wishId, wishId));

      const existingLabelIds = existingLabels.map((l) => l.labelId);

      const existingMetadata = await db
        .select({
          metadataFieldId: schema.metadataValues.metadataFieldId,
          value: schema.metadataValues.value,
        })
        .from(schema.metadataValues)
        .where(eq(schema.metadataValues.wishId, wishId));

      const existingMetadataMap = existingMetadata.reduce(
        (acc, meta) => {
          acc[meta.metadataFieldId] = meta.value;
          return acc;
        },
        {} as Record<number, string>,
      );

      const wishUpdates: Partial<{
        name: string;
        url: string;
        description: string;
      }> = {};

      if (wishName !== undefined) wishUpdates.name = wishName;
      if (url !== undefined) wishUpdates.url = url;
      if (description !== undefined) wishUpdates.description = description;

      if (Object.keys(wishUpdates).length > 0) {
        await db.update(schema.wishes).set(wishUpdates).where(eq(schema.wishes.wishId, wishId));
      }

      const newLabelIds = labels || [];
      const labelsToRemove = existingLabelIds.filter((labelId) => !newLabelIds.includes(labelId));
      const labelsToAdd = newLabelIds.filter((labelId) => !existingLabelIds.includes(labelId));

      if (labelsToRemove.length > 0) {
        await db
          .delete(schema.wishesToLabels)
          .where(
            and(
              eq(schema.wishesToLabels.wishId, wishId),
              inArray(schema.wishesToLabels.labelId, labelsToRemove),
            ),
          );
      }

      if (labelsToAdd.length > 0) {
        await db
          .insert(schema.wishesToLabels)
          .values(labelsToAdd.map((labelId) => ({ wishId, labelId })));
      }

      const newMetadataFieldIds = Object.keys(meta).map((key) =>
        parseInt(key.replace("meta_", "")),
      );
      const metadataFieldsToRemove = Object.keys(existingMetadataMap)
        .map((id) => parseInt(id))
        .filter((fieldId) => !newMetadataFieldIds.includes(fieldId));

      const metadataUpdates: {
        metadataFieldId: number;
        value: string;
        action: "add" | "update";
      }[] = [];

      Object.entries(meta).forEach(([key, value]) => {
        const metadataFieldId = parseInt(key.replace("meta_", ""));
        const existingValue = existingMetadataMap[metadataFieldId];

        if (existingValue === undefined) {
          metadataUpdates.push({ metadataFieldId, value, action: "add" });
        } else if (existingValue !== value) {
          metadataUpdates.push({ metadataFieldId, value, action: "update" });
        }
      });

      if (metadataFieldsToRemove.length > 0) {
        await db
          .delete(schema.metadataValues)
          .where(
            and(
              eq(schema.metadataValues.wishId, wishId),
              inArray(schema.metadataValues.metadataFieldId, metadataFieldsToRemove),
            ),
          );
      }

      if (metadataUpdates.length > 0) {
        const fieldsToUpdate = metadataUpdates.filter((m) => m.action === "update");
        const fieldsToAdd = metadataUpdates.filter((m) => m.action === "add");

        for (const update of fieldsToUpdate) {
          await db
            .update(schema.metadataValues)
            .set({ value: update.value })
            .where(
              and(
                eq(schema.metadataValues.wishId, wishId),
                eq(schema.metadataValues.metadataFieldId, update.metadataFieldId),
              ),
            );
        }

        if (fieldsToAdd.length > 0) {
          await db.insert(schema.metadataValues).values(
            fieldsToAdd.map((field) => ({
              wishId,
              value: field.value,
              metadataFieldId: field.metadataFieldId,
            })),
          );
        }
      }
    } catch (e) {
      console.error(e);
      return fail(500, { updateWish: { errorMap: { root: "Something went wrong" } } });
    }

    redirect(302, `/`);
  },
  deleteWish: async ({ request }): Promise<DeleteWishActionReturn | void> => {
    const formData = await request.formData();
    const dataObject = formDataToObject(formData);

    const { data, error, success } = deleteWishSchema.safeParse(dataObject);

    if (!success) {
      const errorMap = error.issues.reduce<Record<PropertyKey, string>>((acc, issue) => {
        acc[issue.path[0]] = issue.message;
        return acc;
      }, {});
      if (errorMap.wishId) {
        errorMap.root = errorMap.wishId;
        delete errorMap.wishId;
      }
      return fail(400, { deleteWish: { errorMap } });
    }

    try {
      await db.delete(schema.wishes).where(eq(schema.wishes.wishId, data.wishId));
    } catch (e) {
      console.error(e);
      return fail(500, { deleteWish: { errorMap: { root: "Something went wrong" } } });
    }

    redirect(302, `/`);
  },
};
