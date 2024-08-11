<script lang="ts">
  import { RevokableAgreement } from "../../../contracts/build/src/Agreement";
  import { type BasicInfo } from "../../../contracts/build/src/Resume";
	import UiClaims from "./UiClaims.svelte";

  export let zkRevokableAgreement: RevokableAgreement<BasicInfo>;
  export let isInEffect: boolean | undefined;
</script>

<h4>Legal Name</h4>
{zkRevokableAgreement.statement.legalName}
<h4>Also Known As</h4>
{zkRevokableAgreement.statement.knownAsName}
<h4>Email</h4>
{zkRevokableAgreement.statement.email}
<h4>Phone Number</h4>
{zkRevokableAgreement.statement.phoneNumber}
<UiClaims {zkRevokableAgreement} {isInEffect}></UiClaims>
