import { requireAuthenticatedUser } from "$lib/server/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
  const user = requireAuthenticatedUser();
  return { user, pathname: url.pathname };
};
