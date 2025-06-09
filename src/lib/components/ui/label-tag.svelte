<script lang="ts">
  import type { Label } from "$lib/server/db/schema";
  import { stringToColor } from "$lib/utils/styles";

  type Props = {
    label: Label;
  };

  const { label }: Props = $props();

  const { color } = $derived(stringToColor(label.name));
</script>

<span
  class="inline-flex items-center gap-1 rounded-md border px-1"
  style={`border-color: ${color}; background-color: ${color}20`}
>
  <span class="size-3 rounded-full" style={`background-color: ${color}`}></span>
  <span class="text-sm">{label.name}</span>
</span>
