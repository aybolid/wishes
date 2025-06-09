<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = {
    forceError?: boolean;
    label?: string;
    error?: string | string[];
  } & HTMLInputAttributes;

  let { value = $bindable(), ...props }: Props = $props();
</script>

<input
  {...props}
  bind:value
  id={props.id || props.name}
  class={cn(
    "border-border bg-background placeholder:text-muted-foreground/80 h-8 rounded-sm",
    props.class,
  )}
/>
