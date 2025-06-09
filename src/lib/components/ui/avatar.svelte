<script lang="ts">
  import type { SafeUser } from "$lib/server/db/schema";
  import { stringToColor } from "$lib/utils/styles";
  import { Avatar } from "bits-ui";

  type Props = {
    user: SafeUser;
  };

  const { user }: Props = $props();
  const fallback = $derived(user.username.slice(0, 1).toUpperCase());

  const { isDark, color } = $derived(stringToColor(user.userId));
</script>

<Avatar.Root
  delayMs={200}
  class="data-[status=loaded]:border-foreground bg-muted text-muted-foreground size-6 rounded-full border text-[17px] font-medium uppercase data-[status=loading]:border-transparent"
>
  <div
    style="background-color: {color}"
    class="flex size-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"
  >
    <Avatar.Fallback class={isDark ? "text-white" : "text-black"}>{fallback}</Avatar.Fallback>
  </div>
</Avatar.Root>
