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
    "inline-flex size-5 items-center justify-center rounded-full font-mono",
    isDark ? "text-white" : "text-black",
  )}
>
  <span class="leading-0">
    {placeholder}
  </span>
</div>
