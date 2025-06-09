<script lang="ts">
  import { Popover } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    trigger?: Snippet<[{ props: Record<string, unknown> }]>;
    children?: Snippet<[]>;
  };

  const { trigger, children }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      {@render trigger?.({ props })}
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content sideOffset={8} class="bg-background rounded-sm border p-4">
      {@render children?.()}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
