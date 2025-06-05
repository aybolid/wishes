import { requireAuthenticatedUser } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import * as auth from "$lib/server/auth";

export const load: PageServerLoad = async () => {
  const user = requireAuthenticatedUser();

  return { user };
};

export const actions: Actions = {
  logout: async (event) => {
    if (!event.locals.session) {
      return fail(401);
    }
    await auth.invalidateSession(event.locals.session.sessionId);
    auth.deleteSessionTokenCookie(event);

    return redirect(302, "/auth/login");
  },
};
