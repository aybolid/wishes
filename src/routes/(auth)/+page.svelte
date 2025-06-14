<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import { Edit, Eye, Gift, SquareArrowOutUpRight, X } from "lucide-svelte";
  import type { PageProps } from "./$types";
  import UserLink from "$lib/components/common/user-link.svelte";
  import LabelTag from "$lib/components/common/label-tag.svelte";
  import Popover from "$lib/components/ui/popover.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Avatar from "$lib/components/ui/avatar.svelte";
  import { goto } from "$app/navigation";

  const LABELS_TO_SHOW = 3;

  const { data }: PageProps = $props();

  let selectedLabelId = $state<string | undefined>(data.params.labelId ?? undefined);
  let selectedCreatorId = $state<string | undefined>(data.params.creatorId ?? undefined);

  $effect(() => {
    const params = new URLSearchParams();
    if (selectedLabelId) params.set("label", selectedLabelId);
    if (selectedCreatorId) params.set("creator", selectedCreatorId);
    goto(`?${params.toString()}`, { replaceState: true });
  });
</script>

<div class="flex w-full flex-col-reverse items-center justify-between sm:flex-row">
  <div class="flex w-full flex-col items-center gap-2 sm:flex-row">
    <div class="flex w-full items-center sm:w-fit">
      <Select
        class="w-full rounded-r-none sm:w-fit sm:min-w-[160px]"
        placeholder="Filter by creator"
        bind:value={selectedCreatorId}
        items={data.users.map((user) => ({
          value: user.userId.toString(),
          label: user.username,
        }))}
      >
        {#snippet itemRender({ item })}
          <span class="flex items-center gap-2">
            <Avatar user={{ userId: item.value, username: item.label }} />
            <span class="font-medium">{item.label}</span>
          </span>
        {/snippet}
      </Select>
      <Button
        onclick={() => (selectedCreatorId = undefined)}
        disabled={!selectedCreatorId}
        size="icon"
        variant="outline"
        class="size-8.5 rounded-l-none border-l-0"
      >
        <X />
      </Button>
    </div>
    <div class="flex w-full items-center sm:w-fit">
      <Select
        class="rounded-r-none sm:w-fit sm:min-w-[160px]"
        placeholder="Filter by label"
        bind:value={selectedLabelId}
        items={data.labels.map((label) => ({
          value: label.labelId.toString(),
          label: label.name,
        }))}
      >
        {#snippet itemRender({ item })}
          <LabelTag
            label={{
              creatorId: "",
              description: "",
              labelId: parseInt(item.value),
              name: item.label,
            }}
          />
        {/snippet}
      </Select>
      <Button
        onclick={() => (selectedLabelId = undefined)}
        disabled={!selectedLabelId}
        size="icon"
        variant="outline"
        class="size-8.5 rounded-l-none border-l-0"
      >
        <X />
      </Button>
    </div>
  </div>
  <Button href="/create-wish" class="mb-4 w-full sm:mb-0 sm:w-fit">
    <Gift />
    Add Wish
  </Button>
</div>

{#if data.wishes.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No wishes found</p>
{/if}

<section class="mt-4 grid gap-3">
  {#each data.wishes as wish}
    {@const isUserCreator = wish.creatorId === data.user.userId}
    {@const labels = wish.wishesToLabels.map(({ label }) => label)}
    <div class="overflow-hidden rounded-sm border">
      <div class="flex items-center justify-between gap-2 px-3 py-3">
        <h3 class="font-semibold">
          {wish.name}
        </h3>
        <UserLink user={wish.creator} />
      </div>
      {#if wish.description}
        <p class="text-muted-foreground mt-2 px-3">{wish.description}</p>
      {/if}
      <div class="mt-4 flex flex-col items-center justify-between gap-4 px-3 pb-3 sm:flex-row">
        <div class="flex w-full flex-grow flex-wrap items-center justify-start gap-2">
          {#each labels.slice(0, LABELS_TO_SHOW) as label}
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
                {#each labels.slice(LABELS_TO_SHOW) as label}
                  <LabelTag {label} />
                {/each}
              </div>
            </Popover>
          {/if}
        </div>
        <div class="flex w-full items-center justify-end gap-2 sm:w-fit">
          {#if isUserCreator}
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
          {#each wish.metadataValues as metadataValue}
            <p class="text-muted-foreground text-sm">
              {metadataValue.metadataField.name}:
              {#if metadataValue.metadataField.config.type === "boolean"}
                <span class="text-foreground">{metadataValue.value === "true" ? "Yes" : "No"}</span>
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
