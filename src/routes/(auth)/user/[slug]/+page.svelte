<script lang="ts">
  import { enhance } from "$app/forms";
  import Avatar from "$lib/components/ui/avatar.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { Edit, LogOut, SquareArrowOutUpRight } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import LabelTag from "$lib/components/common/label-tag.svelte";
  import Popover from "$lib/components/ui/popover.svelte";

  const LABELS_TO_SHOW = 3;

  const { data }: PageProps = $props();
  const { user, authenticatedUser } = $derived(data);
  const isCurrentUser = $derived(user.userId === authenticatedUser?.userId);
</script>

<div class="flex items-center justify-between">
  <h1 class="flex items-center gap-2 text-xl font-semibold">
    <Avatar {user} />
    {user.username}
  </h1>
  {#if isCurrentUser}
    <form method="post" action="?/logout" use:enhance>
      <Button variant="destructive" size="sm" type="submit">
        <LogOut />
        Logout</Button
      >
    </form>
  {/if}
</div>

{#if data.labels.length > 0}
  <div class="mt-8 flex items-center justify-between gap-4">
    <h2 class="text-lg font-semibold">Labels</h2>
    <span class="text-muted-foreground text-sm">
      {#if isCurrentUser}
        You created these labels
      {:else}
        Labels created by this user
      {/if}
    </span>
  </div>
  <section class="mt-2 flex flex-wrap gap-2">
    {#each data.labels as label, i (`${i}_${label.labelId}`)}
      <LabelTag {label} />
    {/each}
  </section>
{/if}

{#if data.fields.length > 0}
  <div class="mt-4 flex items-center justify-between gap-4">
    <h2 class="text-lg font-semibold">Metadata</h2>
    <span class="text-muted-foreground text-sm">
      {#if isCurrentUser}
        You created these fields
      {:else}
        Fields created by this user
      {/if}
    </span>
  </div>
  <section class="mt-2 flex flex-wrap gap-2">
    {#each data.fields as field, i (`${i}_${field.fieldId}`)}
      <span>
        {field.name}
        <span class="text-primary">({field.config.type})</span>
        {#if data.fields.length - 1 !== i},{/if}
      </span>
    {/each}
  </section>
{/if}

{#if data.wishes.length > 0}
  <div class="mt-8 flex items-center justify-between gap-4">
    <h2 class="text-lg font-semibold">Wishes</h2>
  </div>
  <section class="mt-2 grid gap-3">
    {#each data.wishes as wish, i (`${i}_${wish.wishId}`)}
      {@const labels = wish.wishesToLabels.map(({ label }) => label)}
      <div class="overflow-hidden rounded-sm border">
        <div class="flex items-center justify-between gap-2 px-3 py-3">
          <h3 class="font-semibold">
            {wish.name}
          </h3>
        </div>
        {#if wish.description}
          <p class="text-muted-foreground mt-2 px-3">{wish.description}</p>
        {/if}
        <div class="mt-4 flex flex-col items-center justify-between gap-4 px-3 pb-3 sm:flex-row">
          <div class="flex w-full flex-grow flex-wrap items-center justify-start gap-2">
            {#each labels.slice(0, LABELS_TO_SHOW) as label, i (`${i}_${label.labelId}`)}
              <LabelTag {label} />
            {/each}
            {#if labels.length > LABELS_TO_SHOW}
              <Popover>
                {#snippet trigger({ props })}
                  <span class="text-muted-foreground hover:text-primary cursor-pointer" {...props}>
                    + {labels.length - LABELS_TO_SHOW}
                  </span>
                {/snippet}
                <div class="flex w-min flex-wrap gap-2">
                  {#each labels.slice(LABELS_TO_SHOW) as label, i (`${i}_${label.labelId}`)}
                    <LabelTag {label} />
                  {/each}
                </div>
              </Popover>
            {/if}
          </div>
          <div class="flex w-full items-center justify-end gap-2 sm:w-fit">
            {#if isCurrentUser}
              <Button href={`/edit-wish/${wish.wishId}`} size="sm" variant="outline">
                <Edit />
                Edit
              </Button>
            {/if}
            <Button href={wish.url} target="_blank" size="sm" variant="secondary">
              <SquareArrowOutUpRight />
              Goto
            </Button>
          </div>
        </div>

        {#if wish.metadataValues.length > 0}
          <div class="bg-muted/40 border-t p-3">
            {#each wish.metadataValues as metadataValue, i (`${i}_${metadataValue.metadataField.fieldId}`)}
              <p class="text-muted-foreground text-sm">
                {metadataValue.metadataField.name}:
                {#if metadataValue.metadataField.config.type === "boolean"}
                  <span class="text-foreground"
                    >{metadataValue.value === "true" ? "Yes" : "No"}</span
                  >
                {:else}
                  <span class="text-foreground">{metadataValue.value}</span>
                {/if}
              </p>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </section>
{/if}
