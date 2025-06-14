<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import Button from "$lib/components/ui/button.svelte";
  import Popover from "$lib/components/ui/popover.svelte";
  import type { MetadataFieldWithCreator } from "$lib/server/db/schema";
  import { Edit, Trash } from "lucide-svelte";
  import type { ActionData, PageData } from "./$types";
  import UserLink from "$lib/components/common/user-link.svelte";
  import Drawer from "$lib/components/ui/drawer.svelte";
  import UpdateMetaForm from "./update-meta-form.svelte";

  const { fields, user } = $derived(page.data as PageData);
  const form = $derived<ActionData>(page.form);
</script>

{#if fields.length === 0}
  <p class="text-muted-foreground mt-4 text-center">No metadata found</p>
{/if}

{#snippet fieldCard(field: MetadataFieldWithCreator)}
  {@const isUserCreator = field.creatorId === user.userId}
  <div class="rounded-sm border p-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="font-semibold">
        {field.name}
      </h3>
      <UserLink user={field.creator} />
    </div>
    {#if field.description}
      <p class="text-muted-foreground mt-2 flex-1">{field.description}</p>
    {/if}
    <p class="mt-4">
      Type: <span class="text-primary uppercase">{field.config.type}</span>
    </p>
    {#if field.config.type === "option"}
      <p>
        Possible values:
        <span class="text-muted-foreground">
          {field.config.options.join(", ")}
        </span>
      </p>
    {/if}
    {#if isUserCreator}
      <div class="mt-4 flex items-center justify-end gap-2">
        <Drawer title="Edit metadata" description="Update metadata field details">
          {#snippet trigger({ props })}
            <Button title="Edit" size="icon" variant="secondary" {...props}>
              <Edit size={16} />
            </Button>
          {/snippet}
          {#snippet children({ setOpen })}
            <UpdateMetaForm {field} onUpdate={() => setOpen(false)} />
          {/snippet}
        </Drawer>
        <Popover>
          {#snippet trigger({ props })}
            <Button {...props} type="button" title="Delete" size="icon" variant="destructive">
              <Trash size={16} />
            </Button>
          {/snippet}

          <h3 class="font-semibold">Delete field</h3>
          <p class="text-muted-foreground mt-1 mb-3 text-sm">
            Are you sure you want to delete this field?
          </p>
          <form
            class="ml-auto w-fit"
            method="post"
            action="?/deleteMetadata"
            use:enhance={({ formData }) => {
              formData.set("fieldId", field.fieldId.toString());
              return ({ update }) => {
                update();
              };
            }}
          >
            <Button type="submit" size="sm" variant="destructive">
              <Trash />
              Delete
            </Button>
          </form>
        </Popover>
      </div>
    {/if}
  </div>
{/snippet}

<section class="mt-4 grid gap-4">
  {#each fields as field, i (i + field.fieldId.toString())}
    {@render fieldCard(field)}
  {/each}
</section>
