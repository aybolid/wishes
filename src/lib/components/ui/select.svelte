<script lang="ts">
  import { Select } from "bits-ui";
  import { Check, ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-svelte";

  type Props = {
    value?: string;
    placeholder?: string;
    id?: string;
  } & Omit<Select.RootProps, "value" | "onValueChange" | "type">;

  let { value = $bindable(), placeholder = "Select", ...props }: Props = $props();

  const selectedLabel = $derived(
    value ? props.items?.find((item) => item.value === value)?.label : placeholder,
  );
</script>

<Select.Root type="single" onValueChange={(v) => (value = v)} {...props}>
  <Select.Trigger
    id={props.id || props.name}
    class="focus:ring-primary bg-background data-placeholder:text-muted-foreground/80 inline-flex w-full items-center rounded-sm border px-3 py-1 select-none focus:ring"
    aria-label="Select an option"
  >
    {selectedLabel}
    <ChevronsUpDown size={16} class="text-muted-foreground ml-auto" />
  </Select.Trigger>

  <Select.Portal>
    <Select.Content
      class="bg-background z-50 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-sm border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      sideOffset={10}
    >
      <Select.ScrollUpButton class="flex w-full items-center justify-center">
        <ChevronUp size={16} class="text-muted-foreground" />
      </Select.ScrollUpButton>

      <Select.Viewport class="p-1">
        {#each props.items ?? [] as item, i (i + item.value)}
          <Select.Item
            class="data-highlighted:bg-muted flex h-10 w-full items-center rounded-sm py-3 pr-1.5 pl-5 text-sm capitalize outline-hidden select-none data-disabled:opacity-50"
            value={item.value}
            label={item.label}
            disabled={item.disabled}
          >
            {#snippet children({ selected })}
              {item.label}
              {#if selected}
                <div class="ml-auto">
                  <Check size={16} class="text-primary" />
                </div>
              {/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>

      <Select.ScrollDownButton class="flex w-full items-center justify-center">
        <ChevronDown size={16} class="text-muted-foreground" />
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
</Select.Root>
