<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutServerData } from "./$types";
  import { cn } from "$lib/utils/styles";
  import UserLink from "$lib/components/common/user-link.svelte";

  const { data, children }: { data: LayoutServerData; children: Snippet<[]> } = $props();
  const { user, pathname } = $derived(data);

  const LINKS: {
    label: string;
    href: string;
  }[] = [
    { label: "Wishes", href: "/" },
    { label: "Labels", href: "/labels" },
    { label: "Metadata", href: "/meta" },
  ];
</script>

{#snippet header()}
  <header class="bg-background fixed top-0 right-0 left-0 z-10 px-4 pt-6">
    <nav class="mx-auto flex max-w-4xl items-center gap-2 border-b py-2">
      {#each LINKS as { label, href }}
        <a
          {href}
          class={cn(
            "hover:underline",
            pathname === href
              ? "text-foreground font-semibold"
              : "text-muted-foreground font-normal",
          )}>{label}</a
        >
      {/each}
      <div class="ml-auto">
        <UserLink {user} />
      </div>
    </nav>
  </header>
{/snippet}

<div class="flex h-full w-full flex-col">
  {@render header()}
  <main class="px-4 pt-24 pb-6">
    <div class="mx-auto w-full max-w-3xl">{@render children()}</div>
  </main>
</div>
