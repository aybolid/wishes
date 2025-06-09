<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  type Props = {
    forceError?: boolean;
    label?: string;
    error?: string | string[];
  } & HTMLTextareaAttributes;

  let { value = $bindable(), ...props }: Props = $props();
</script>

<textarea
  {...props}
  bind:value
  id={props.id || props.name}
  class={cn(
    "border-border bg-background placeholder:text-muted-foreground/80 h-full max-h-32 min-h-12 rounded-sm",
    props.class,
  )}
></textarea>
