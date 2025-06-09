<script lang="ts">
  import { onMount, tick, type Snippet } from "svelte";
  import Button from "./button.svelte";
  import type { HTMLFormAttributes } from "svelte/elements";
  import { enhance } from "$app/forms";

  type Props = {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    confirmForm?: HTMLFormAttributes & { enhance?: Parameters<typeof enhance>[1] };
    children: Snippet;
  };

  const {
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmForm,
    onConfirm = () => {},
    onCancel = () => {},
    children,
  }: Props = $props();

  let open = $state(false);

  let popoverElement: HTMLDivElement | undefined = $state();
  let triggerElement: HTMLDivElement | undefined = $state();
  let position = $state({ top: 0, left: 0 });

  function calculatePosition() {
    if (!triggerElement || !popoverElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const popoverRect = popoverElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = triggerRect.bottom + 8;
    let left = triggerRect.left;

    if (left + popoverRect.width > viewport.width - 16) {
      left = viewport.width - popoverRect.width - 16;
    }
    if (left < 16) {
      left = 16;
    }

    if (top + popoverRect.height > viewport.height - 16) {
      top = triggerRect.top - popoverRect.height - 8;
    }

    position = { top, left };
  }

  $effect(() => {
    if (!open || !triggerElement) return;
    tick().then(() => {
      calculatePosition();
    });
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      handleCancel();
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Node) || !open) return;

    const isClickInsideTrigger = triggerElement?.contains(target);
    const isClickInsidePopover = popoverElement?.contains(target);

    if (!isClickInsidePopover && !isClickInsideTrigger) {
      handleCancel();
    }
  }

  function handleTriggerClick() {
    open = !open;
  }

  function handleConfirm() {
    onConfirm();
    open = false;
  }

  function handleCancel() {
    onCancel();
    open = false;
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("resize", calculatePosition);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", calculatePosition);
    };
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  bind:this={triggerElement}
  class="inline-block"
  onclick={handleTriggerClick}
  role="button"
  tabindex="-1"
>
  {@render children()}
</div>

{#if open}
  <div
    bind:this={popoverElement}
    class="bg-background fixed z-50 max-w-96 min-w-80 rounded-sm border p-4"
    style="top: {position.top}px; left: {position.left}px;"
    role="dialog"
    aria-modal="true"
    aria-labelledby="popover-title"
  >
    <div class="mb-3 flex items-start gap-3">
      <div class="flex-1">
        <h3 class="font-semibold">
          {title}
        </h3>
        <p class="text-muted-foreground text-sm">
          {message}
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <Button type="submit" variant="secondary" onclick={handleCancel} size="sm">
        {cancelText}
      </Button>

      {#if confirmForm}
        <form {...confirmForm} use:enhance={confirmForm.enhance}>
          <Button type="submit" variant="destructive" size="sm">
            {confirmText}
          </Button>
        </form>
      {:else}
        <Button type="button" variant="destructive" onclick={handleConfirm} size="sm">
          {confirmText}
        </Button>
      {/if}
    </div>
  </div>
{/if}
