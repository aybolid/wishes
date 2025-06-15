<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import "../app.css";
  import type { LayoutProps } from "./$types";

  const { children }: LayoutProps = $props();
</script>

<svelte:head>
  <title>Wishes</title>
</svelte:head>

<Toaster richColors />

{@render children()}
