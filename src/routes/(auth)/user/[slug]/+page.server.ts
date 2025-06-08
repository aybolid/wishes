import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import * as schema from "$lib/server/db/schema";
import { fail, redirect } from "@sveltejs/kit";
import { requireAuthenticatedUser } from "$lib/server/auth";
import * as auth from "$lib/server/auth";

export const load: PageServerLoad = async ({ params }) => {
  const authenticatedUser = requireAuthenticatedUser();

  const userId = params.slug;

  try {
    const user = await db.query.users.findFirst({ where: eq(schema.users.userId, userId) });

    if (!user) {
      return fail(404, { message: "User not found" });
    }

    return { user, isCurrentUser: user.userId === authenticatedUser.userId };
  } catch (e) {
    console.error(e);
    fail(500, { message: "Something went wrong" });
  }
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
