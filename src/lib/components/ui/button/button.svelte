<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import { cva, type VariantProps } from "class-variance-authority";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  const buttonVariants = cva(
    "rounded-sm w-fit transition-all duration-150 ease-in-out disabled:opacity-60 disabled:pointer-events-none",
    {
      variants: {
        variant: {
          primary: "bg-primary text-primary-foreground hover:bg-primary/90",
          secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          danger: "bg-destructive text-primary-foreground hover:bg-destructive/90",
        },
        size: {
          sm: "px-2 py-1 text-sm",
          md: "px-4 py-1 text-md",
          lg: "px-4 py-2 text-md",
          xl: "px-6 py-2 text-lg",
        },
      },
      defaultVariants: {
        variant: "primary",
        size: "md",
      },
    },
  );

  type Props = {
    children: Snippet<[]>;
  } & HTMLButtonAttributes;

  const { children, variant, size, ...props }: Props & VariantProps<typeof buttonVariants> =
    $props();
</script>

<button {...props} class={cn(buttonVariants({ variant, size }), props.class)}>
  {@render children()}
</button>
