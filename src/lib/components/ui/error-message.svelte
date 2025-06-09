<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet<[]>;
  };

  const { children }: Props = $props();
</script>

{#if children}
  <p class="text-destructive text-sm">{@render children()}</p>
{/if}
