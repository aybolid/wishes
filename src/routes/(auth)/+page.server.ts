import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import * as schema from "$lib/server/db/schema";
import { and, desc, eq, exists } from "drizzle-orm";

export const load: PageServerLoad = async ({ url }) => {
  const params = new URLSearchParams(url.search);
  const labelIdParam = params.get("label");
  const creatorIdParam = params.get("creator");

  const wishes = await db.query.wishes
    .findMany({
      with: {
        creator: { columns: { passwordHash: false } },
        metadataValues: {
          with: { metadataField: true },
        },
        wishesToLabels: {
          with: { label: true },
        },
      },
      orderBy: desc(schema.wishes.wishId),
      where: and(
        creatorIdParam ? eq(schema.wishes.creatorId, creatorIdParam) : undefined,
        labelIdParam
          ? exists(
              db
                .select()
                .from(schema.wishesToLabels)
                .where(
                  and(
                    eq(schema.wishesToLabels.wishId, schema.wishes.wishId),
                    eq(schema.wishesToLabels.labelId, parseInt(labelIdParam)),
                  ),
                ),
            )
          : undefined,
      ),
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  const labels: schema.Label[] = await db.query.labels
    .findMany({
      orderBy: desc(schema.labels.labelId),
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

  return {
    wishes,
    users,
    labels,
    params: { labelId: labelIdParam, creatorId: creatorIdParam },
  };
};
