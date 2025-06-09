<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import { Label } from "bits-ui";

  type Props = { required?: boolean } & Label.RootProps;

  const { children, required = false, ...props }: Props = $props();
</script>

<Label.Root
  {...props}
  class={cn(
    "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    props.class,
  )}
>
  {@render children?.()}
  {#if required}
    <span class="text-destructive">*</span>
  {/if}
</Label.Root>
