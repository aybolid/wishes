<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button.svelte";
  import type { PageServerData } from "./$types";

  const { data }: { data: PageServerData } = $props();
  const user = $derived(data.user);
</script>

<h1>User: {user?.username}</h1>

<form method="post" action="?/logout" use:enhance>
  <Button variant="destructive" size="sm" type="submit">Logout</Button>
</form>
