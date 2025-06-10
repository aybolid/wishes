<script lang="ts">
  import { Dialog, Separator } from "bits-ui";
  import type { Snippet } from "svelte";
  import Button from "./button.svelte";
  import { X } from "lucide-svelte";

  type Props = {
    trigger?: Snippet<[{ props: Record<string, unknown> }]>;
    children?: Snippet<[{ setOpen: (open: boolean) => void }]>;
    title?: string;
    description?: string;
    onOpenChange?: (open: boolean) => void;
  };
  const { trigger, children, title, description, onOpenChange }: Props = $props();

  let open = $state(false);
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      {@render trigger?.({ props })}
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <Dialog.Content
      class="data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right bg-background fixed inset-y-0 right-0 z-50 w-full max-w-[320px] border-l p-4 outline-hidden"
    >
      <Dialog.Close class="absolute top-4 right-4">
        <Button size="icon" variant="secondary"><X /></Button>
      </Dialog.Close>
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
        <Separator.Root class="bg-border -mx-4 my-4 block h-px" />
      {/if}
      {@render children?.({ setOpen: (b) => (open = b) })}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
