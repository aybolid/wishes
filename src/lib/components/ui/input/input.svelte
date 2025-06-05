<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = { hasError?: boolean } & HTMLInputAttributes;

  const { hasError = false, ...props }: Props = $props();
</script>

<input
  {...props}
  id={props.id ?? props.name}
  class={cn("border-border h-8 rounded-sm", { "border-destructive": hasError }, props.class)}
/>
