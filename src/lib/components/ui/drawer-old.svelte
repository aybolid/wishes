<script lang="ts">
  import { cva } from "class-variance-authority";
  import type { Snippet } from "svelte";
  import Button from "./button.svelte";
  import { X } from "lucide-svelte";

  type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    side?: "left" | "right" | "top" | "bottom";
    size?: number;
    showOverlay?: boolean;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
    title?: string;
    children?: Snippet<[]>;
  };

  const {
    isOpen = false,
    onClose = () => {},
    side = "right",
    size = 320,
    showOverlay = true,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    title = "",
    children,
  }: Props = $props();

  let drawerElement: HTMLElement | undefined = $state();

  const drawerVariants = cva(
    "fixed bg-background shadow-lg transition-transform duration-300 ease-in-out z-50 will-change-transform",
    {
      variants: {
        side: {
          left: "left-0 top-0 h-full border-r",
          right: "right-0 top-0 h-full border-l",
          top: "top-0 left-0 w-full border-b",
          bottom: "bottom-0 left-0 w-full border-t",
        },
        isOpen: {
          true: "",
          false: "",
        },
      },
      compoundVariants: [
        {
          side: "left",
          isOpen: true,
          class: "translate-x-0",
        },
        {
          side: "left",
          isOpen: false,
          class: "-translate-x-full",
        },
        {
          side: "right",
          isOpen: true,
          class: "translate-x-0",
        },
        {
          side: "right",
          isOpen: false,
          class: "translate-x-full",
        },
        {
          side: "top",
          isOpen: true,
          class: "translate-y-0",
        },
        {
          side: "top",
          isOpen: false,
          class: "-translate-y-full",
        },
        {
          side: "bottom",
          isOpen: true,
          class: "translate-y-0",
        },
        {
          side: "bottom",
          isOpen: false,
          class: "translate-y-full",
        },
      ],
      defaultVariants: {
        side: "right",
        isOpen: false,
      },
    },
  );

  const overlayVariants = cva(
    "fixed inset-0 bg-black transition-opacity duration-300 z-40, cursor-default",
    {
      variants: {
        isOpen: {
          true: "opacity-60",
          false: "opacity-0 pointer-events-none",
        },
      },
      defaultVariants: {
        isOpen: false,
      },
    },
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && closeOnEscape && isOpen) {
      onClose();
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }

  $effect(() => {
    if (isOpen && drawerElement) {
      drawerElement.focus();
    }
  });

  function getSizeStyle() {
    if (side === "left" || side === "right") {
      return `width: ${size}px`;
    } else {
      return `height: ${size}px`;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen || showOverlay}
  {#if showOverlay}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class={overlayVariants({ isOpen })}
      onclick={handleOverlayClick}
      role="button"
      tabindex="-1"
      aria-label="Close drawer"
    ></div>
  {/if}

  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <aside
    bind:this={drawerElement}
    class={drawerVariants({ side, isOpen })}
    style={getSizeStyle()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="h-full overflow-y-auto">
      <div class="flex items-center justify-between border-b p-4">
        {#if title}
          <h2 class="text-lg font-semibold">
            {title}
          </h2>
        {/if}
        <Button
          onclick={onClose}
          aria-label="Close drawer"
          class="ml-auto"
          size="icon"
          variant="secondary"
        >
          <X size={16} />
        </Button>
      </div>

      {#if children}
        <div class="p-4">
          {@render children()}
        </div>
      {/if}
    </div>
  </aside>
{/if}
