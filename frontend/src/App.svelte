<script lang="ts">
    import { Router, Route } from 'svelte-routing';
    import LandingPage from './lib/LandingPage.svelte';

    export let url = "";
</script>

<Router {url}>
    <Route path="/">
        <LandingPage />
    </Route>
</Router>