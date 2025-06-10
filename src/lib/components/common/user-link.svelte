<script lang="ts">
  import type { SafeUser } from "$lib/server/db/schema";
  import Avatar from "../ui/avatar.svelte";

  type Props = {
    user: SafeUser;
  };
  const { user }: Props = $props();
</script>

<a href={`/user/${user.userId}`} class="flex items-center gap-2 rounded-full">
  <span class="font-medium">{user.username}</span>
  <Avatar {user} />
</a>
