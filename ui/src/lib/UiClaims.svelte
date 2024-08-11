<script lang="ts">
  import { RevokableAgreement } from "../../../contracts/build/src";

  export let zkRevokableAgreement: RevokableAgreement<any>;
  export let isInEffect : undefined | boolean;
</script>

<div class={isInEffect ? "claims" : "claimsbad"}>
  claimant: {zkRevokableAgreement.claimant.getAndRequireEquals().toBase58()}<br>
  signer: {zkRevokableAgreement.signer.getAndRequireEquals().toBase58()}<br>
  effective:
    {#if isInEffect === undefined}
      checking...
    {:else if isInEffect}
      yes
    {:else}
      no
    {/if}
  <br>
</div>
  
<style>
  .claims {
    border-radius: 5px;
    border-color: blue;
    border-width: 1px 1px 1px 1px;
    border-style: solid;
    padding: 0.3em;
    margin: 0.5em;
  }

  .claimsbad {
    border-radius: 5px;
    border-color: red;
    border-width: 2px 2px 2px 2px;
    border-style: solid;
    padding: 0.3em;
    margin: 0.5em;
  }

</style>