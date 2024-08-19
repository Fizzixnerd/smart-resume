<script lang="ts">
  import {Resume} from '../../../contracts/build/src';
	import UiBasicInfo from './UiBasicInfo.svelte';
	import UiEducation from './UiEducation.svelte';
	import UiWorkHistory from './UiWorkHistory.svelte';
  import {writable, type Writable} from "svelte/store";

  export let zkResume: Resume;
  let basicInfoInEffect: Writable<undefined | boolean> = writable(undefined);
  let workHistoryInEffects: Writable<(boolean | undefined)[]> = writable([undefined].fill(undefined, 0, zkResume.workHistory.length));
  let educationInEffects: Writable<(boolean | undefined)[]> = writable([undefined].fill(undefined, 0, zkResume.education.length));
  (async () => {
    basicInfoInEffect.set((await zkResume.basicInfo.isInEffect()).toBoolean());
    for (let i = 0; i < zkResume.workHistory.length; i++) {
      const inEffect = (await zkResume.workHistory[i].isInEffect()).toBoolean();
      workHistoryInEffects.update(xs => xs.with(i, inEffect));
    }
    for (let i = 0; i < zkResume.education.length; i++) {
      const inEffect = (await zkResume.education[i].isInEffect()).toBoolean();
      educationInEffects.update(xs => xs.with(i, inEffect))
    }
  })();
</script>

<div>
  <section class="basic-info">
    <h3>Basic Info</h3>
    <UiBasicInfo zkRevokableAgreement={zkResume.basicInfo} isInEffect={$basicInfoInEffect}></UiBasicInfo>
  </section>
  <section class="work-history">
    <h3>Work History</h3>
    {#each zkResume.workHistory as workHistoryItem, i}
      <UiWorkHistory zkRevokableAgreement={workHistoryItem} isInEffect={$workHistoryInEffects[i]}></UiWorkHistory>
    {/each}
  </section>
  <section class="education">
    <h3>Education</h3>
    {#each zkResume.education as education, i}
      <UiEducation zkRevokableAgreement={education} isInEffect={$educationInEffects[i]}></UiEducation>
    {/each}
  </section>
</div>

<style>
  .basic-info {
    background: lightblue;
    border-radius: 3px;
  }
  
  .education {
    background: lightblue;
    border-radius: 3px;
  }
  
</style>