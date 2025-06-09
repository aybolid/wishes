<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutServerData } from "./$types";
  import { cn } from "$lib/utils/styles";
  import Avatar from "$lib/components/ui/avatar.svelte";

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
  <header class="px-4 py-6">
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
      <a href={`/user/${user.userId}`} class="ml-auto inline-flex items-center gap-1">
        <Avatar username={user.username} />
        <span class="-mt-1">
          {user.username}
        </span>
      </a>
    </nav>
  </header>
{/snippet}

<div class="flex h-full w-full flex-col">
  {@render header()}
  <main class="px-4 py-6">
    <div class="mx-auto w-full max-w-4xl">{@render children()}</div>
  </main>
</div>
