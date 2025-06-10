<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import { Gift } from "lucide-svelte";
</script>

<div class="flex w-full items-center justify-between">
  <Button href="/create-wish">
    <Gift />
    Add Wish
  </Button>
</div>
