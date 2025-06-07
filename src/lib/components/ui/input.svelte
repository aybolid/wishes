<script lang="ts">
  import { cn } from "$lib/utils/styles";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = {
    /** Forces the input to be in error state if `true`. */
    forceError?: boolean;
    /** The label for the input. */
    label?: string;
    /** The error message(s) for the input. */
    error?: string | string[];
  } & HTMLInputAttributes;

  const { forceError = false, label = "", error, ...props }: Props = $props();
  const hasError = $derived(forceError || (error?.length ?? 0) > 0);
</script>

{#if label}
  <label for={props.id ?? props.name} class={cn("text-sm", hasError && "text-destructive")}>
    {label}
  </label>
{/if}

<input
  {...props}
  id={props.id ?? props.name}
  class={cn("border-border h-8 rounded-sm", { "border-destructive": hasError }, props.class)}
/>

{#if error && error.length > 0}
  {#if Array.isArray(error)}
    {#each error as error}
      <p class="text-destructive text-sm">{error}</p>
    {/each}
  {:else}
    <p class="text-destructive text-sm">{error}</p>
  {/if}
{/if}
