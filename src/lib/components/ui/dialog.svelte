<script lang="ts">
  import { Dialog, Separator } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    trigger?: Snippet<[{ props: Record<string, unknown> }]>;
    children?: Snippet<[]>;
    title?: string;
    description?: string;
  };
  const { trigger, children, title, description }: Props = $props();
</script>

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet child({ props })}
      {@render trigger?.({ props })}
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="bg-background shadow-popover fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-sm border p-4 outline-hidden sm:max-w-[490px] md:w-full"
    >
      {#if title}
        <Dialog.Title class="text-lg font-semibold tracking-tight">
          {title}
        </Dialog.Title>
      {/if}
      {#if description}
        <Dialog.Description class="text-muted-foreground text-sm">
          {description}
        </Dialog.Description>
      {/if}
      {#if title || description}
        <Separator.Root class="bg-muted -mx-4 my-4 block h-px" />
      {/if}

      {@render children?.()}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
