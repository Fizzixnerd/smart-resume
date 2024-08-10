<script lang="ts">
  import { RevokableAgreement } from "../../../contracts/build/src";

  export let zkRevokableAgreement: RevokableAgreement;
</script>

<div>
  {zkRevokableAgreement.statement.value}
</div>
<div>
  claimant: {zkRevokableAgreement.claimant.get().toBase58()}<br>
  signer: {zkRevokableAgreement.signer.get().toBase58()}<br>
  effective:
  {#await zkRevokableAgreement.isInEffect().then(x => x.toBoolean())}
    checking...
  {:then isInEffect} 
    {#if isInEffect}
      yes
    {:else}
      no
    {/if}
  {/await}
  <br>
</div>