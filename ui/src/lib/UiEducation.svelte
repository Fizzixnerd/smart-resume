<script lang="ts">
  import { RevokableAgreement } from "../../../contracts/build/src/Agreement";
  import { type Education } from "../../../contracts/build/src/Resume";
  import UiClaims from "./UiClaims.svelte";

  export let zkRevokableAgreement: RevokableAgreement<Education>;
  export let isInEffect: boolean | undefined;
</script>

<h4>Insitution</h4>
{zkRevokableAgreement.statement.institutionLegalName}
<h4>Degree</h4>
{zkRevokableAgreement.statement.degree}
<h5>{zkRevokableAgreement.statement.subject}</h5>
{#if zkRevokableAgreement.statement.gpa}}
  <h5>GPA: {zkRevokableAgreement.statement.gpa}</h5>
{/if}
<h5>Graduated: {zkRevokableAgreement.statement.graduationDate}</h5>
<UiClaims {zkRevokableAgreement} {isInEffect}></UiClaims>
