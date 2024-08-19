<script lang="ts">
  import { RevokableAgreement } from "../../../contracts/build/src/Agreement";
  import { type WorkHistory } from "../../../contracts/build/src/Resume";
  import UiClaims from "./UiClaims.svelte";

  export let zkRevokableAgreement: RevokableAgreement<WorkHistory>;
  export let isInEffect: boolean | undefined;
</script>

<h4>Employer Legal Name</h4>
{zkRevokableAgreement.statement.employerLegalName}<br>
{zkRevokableAgreement.statement.employerAddress.streetAddress}, {zkRevokableAgreement.statement.employerAddress.country}
{#each zkRevokableAgreement.statement.jobs as job}
  <h5>{job.title}</h5>
  {job.startDate} - {job.endDate || "present"}<br>
  {job.jobDescription}
  <h5>Skills:</h5>
  {#each job.skills as skill}
    {skill + " "} 
  {/each}
{/each}<br>
<UiClaims {zkRevokableAgreement} {isInEffect}></UiClaims>
