<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = { element?: HTMLInputElement } & HTMLInputAttributes;

  let { value = $bindable(), element = $bindable(), ...props }: Props = $props();
</script>

<input
  {...props}
  bind:value
  bind:this={element}
  id={props.id || props.name}
  class={cn(
    "border-border bg-background placeholder:text-muted-foreground/80 h-8 rounded-sm",
    props.class,
  )}
/>
