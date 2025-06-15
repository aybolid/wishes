import { db } from "$lib/server/db";
import { desc, eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import * as schema from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import * as auth from "$lib/server/auth";

export const load: PageServerLoad = async ({ params }) => {
  const authenticatedUser = requireAuthenticatedUser();

  const userId = params.slug;

  const user = await db.query.users
    .findFirst({
      where: eq(schema.users.userId, userId),
      columns: { passwordHash: false },
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });

  if (!user) {
    return redirect(302, "/");
  }

  const labels: schema.Label[] = await db.query.labels
    .findMany({
      where: eq(schema.labels.creatorId, userId),
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  const fields: schema.MetadataField[] = await db.query.metadataFields
    .findMany({
      where: eq(schema.metadataFields.creatorId, userId),
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

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
      where: eq(schema.wishes.creatorId, userId),
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  return { user, authenticatedUser, labels, fields, wishes };
};

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return redirect(302, "/login");
    }
    await auth.invalidateSession(event.locals.session.sessionId);
    auth.deleteSessionTokenCookie(event);

    return redirect(302, "/login");
  },
};
