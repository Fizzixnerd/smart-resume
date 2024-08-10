<script lang="ts">
  import {Resume} from '../../../contracts/build/src';
	import UiRevokableAgreement from './UiRevokableAgreement.svelte';
  import UiResume from './UiResume.svelte'

  export let zkResume: Resume;

  export const subsections = zkResume.subsections;
  export const statements = zkResume.statements;
</script>

<div>
  <section>
    {#each statements as statement}
      <UiRevokableAgreement zkRevokableAgreement={statement}></UiRevokableAgreement>
    {/each}
  </section>
  <section>
    {#each subsections as subsection}
      <UiResume zkResume={subsection}></UiResume>
    {/each}
  </section>
</div>
