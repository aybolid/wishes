<script lang="ts">
  import { cn, stringToColor } from "$lib/utils/styles";

  type Props = {
    username: string;
  };

  const { username }: Props = $props();
  const placeholder = $derived(username.slice(0, 1).toUpperCase());

  const { isDark, color } = $derived(stringToColor(username));
</script>

<div
  style={`background-color: ${color}`}
  class={cn(
    "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono",
    isDark ? "text-white" : "text-black",
  )}
>
  {placeholder}
</div>
