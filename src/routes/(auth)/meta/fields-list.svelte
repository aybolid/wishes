<script lang="ts">
  import Avatar from "$lib/components/ui/avatar.svelte";
  import type { MetadataFieldWithCreator } from "$lib/server/db/schema";

  type Props = {
    fields: MetadataFieldWithCreator[];
  };

  const { fields }: Props = $props();
</script>

{#if fields.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No metadata yet</p>
{/if}

{#snippet fieldCard(field: MetadataFieldWithCreator)}
  <div class="rounded-sm border p-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="font-semibold">
        {field.name}
        <span class="text-primary font-normal">({field.config.type})</span>
      </h3>
      <a href={`/user/${field.creator.userId}`} class="ml-auto inline-flex items-center gap-1">
        <Avatar username={field.creator.username} />
        <span class="-mt-1">
          {field.creator.username}
        </span>
      </a>
    </div>
    {#if field.description}
      <p class="text-muted-foreground mt-2 flex-1">{field.description}</p>
    {/if}
    {#if field.config.type === "option"}
      <p class="mt-4">
        Possible values:
        <span class="text-muted-foreground">
          {field.config.options.join(", ")}
        </span>
      </p>
    {/if}
  </div>
{/snippet}

<section class="mt-4 grid gap-4">
  {#each fields as field, i (i + field.fieldId.toString())}
    {@render fieldCard(field)}
  {/each}
</section>
