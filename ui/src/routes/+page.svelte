
<script lang="ts">
  import heroMinaLogo from '$lib/assets/hero-mina-logo.svg'
  import arrowRightSmall from '$lib/assets/arrow-right-small.svg'
  import { onMount } from 'svelte'
  import { Mina, PrivateKey, AccountUpdate, Field } from 'o1js'
	import UiResume from '$lib/UiResume.svelte';
  import { Resume, type BasicInfo, type WorkHistory, type Education } from '../../../contracts/build/src/Resume';
  import { RevokableAgreement, Tags } from '../../../contracts/build/src/Agreement';
  
  let { promise: zkApp, resolve: resolveZkApp }: PromiseWithResolvers<Resume> = Promise.withResolvers()
  onMount(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    const [deployerAccount, claimantAccount, signerAccount] = Local.testAccounts;
    const deployerKey = deployerAccount.key;
    const claimantKey = claimantAccount.key;
    const signerKey = signerAccount.key;

    const basicInfo = PrivateKey.random();
    const basicInfoAddress = basicInfo.toPublicKey();

    const workHistory0 = PrivateKey.random();
    const workHistory0Address = workHistory0.toPublicKey();

    const education0 = PrivateKey.random();
    const education0Address = education0.toPublicKey();

    const basicInfoObject: BasicInfo = {
      legalName: "Matthew Gordon Douglas Walker",
      knownAsName: "Matt",
      gender: "male",
      address: {
        streetAddress: "Toronto, Ontario",
        country: "Canada",
      },
      email: "matt.g.d.walker@gmail.com",
      phoneNumber: "14168854777",
    }

    const workHistory0Object: WorkHistory = {
      employerLegalName: "O(1) Labs",
      employerAddress: {
        streetAddress: "California",
        country: "USA",
      },
      jobs: [
        {
          title: "Protocol Engineer",
          startDate: 2460542,
          endDate: null,
          jobDescription: "Working on Protocol Engineering stuff!",
          skills: ["ocaml", "typescript", "rust", "haskell", "devops", "cryptography", "blockchain"],
        }
      ]
    }

    const education0Object: Education = {
      institutionLegalName: "University of Toronto",
      institutionAddress: {
        streetAddress: "Toronto, Ontario",
        country: "Canada",
      },
      degree: "Honours Bachelor of Science",
      gpa: null,
      subject: "Mathematics and Physics Specialist",
      graduationDate: 2458238,
    } 

    const basicInfoAgreement: RevokableAgreement<BasicInfo> = new RevokableAgreement(basicInfoAddress, claimantAccount, claimantAccount, Field.random(), basicInfoObject, Tags.BasicInfo);
    const workHistoryAgreements: RevokableAgreement<WorkHistory>[] = [
      new RevokableAgreement(workHistory0Address, claimantAccount, signerAccount, Field.random(), workHistory0Object, Tags.WorkHistory)
    ];
    const educationAgreements: RevokableAgreement<Education>[] = [
      new RevokableAgreement(education0Address, claimantAccount, signerAccount, Field.random(), education0Object, Tags.Education)
    ];

    const resume = new Resume(basicInfoAgreement, workHistoryAgreements, educationAgreements);

    const txn = await Mina.transaction(deployerAccount, async () => {
      await AccountUpdate.fundNewAccount(deployerAccount, 1 + workHistoryAgreements.length + educationAgreements.length);
      await basicInfoAgreement.deploy();
      for (const agreement of workHistoryAgreements) {
        await agreement.deploy();
      }
      for (const agreement of educationAgreements) {
        await agreement.deploy();
      }
    });
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await (await txn.prove()).sign([deployerKey, basicInfo, workHistory0, education0]).send();
    
    const txn2 = await Mina.transaction(deployerAccount, async () => {
      await basicInfoAgreement.claimantAgree(claimantKey, basicInfoAgreement.salt, basicInfoAgreement.encode());
      await basicInfoAgreement.signerAgree(claimantKey, basicInfoAgreement.salt, basicInfoAgreement.encode());
    }).prove().then(x => x.sign([deployerKey, basicInfo]).send())

    const txn3 = await Mina.transaction(deployerAccount, async () => {
      for (const agreement of workHistoryAgreements) {
        await agreement.claimantAgree(claimantKey, agreement.salt, agreement.encode());
        await agreement.signerAgree(signerKey, agreement.salt, agreement.encode());
      }
      for (const agreement of educationAgreements) {
        await agreement.claimantAgree(claimantKey, agreement.salt, agreement.encode());
        await agreement.signerAgree(signerKey, agreement.salt, agreement.encode());
      }
    });
    await (await txn3.prove()).sign([deployerKey, workHistory0, education0]).send();

    resolveZkApp(resume)
  })
</script>

<style global>
  @import '../styles/Home.module.css';
</style>

<svelte:head>
  <title>Mina zkResume UI</title>
</svelte:head>
<main class="main">
  <div class="center">
    <a
      href="https://minaprotocol.com/"
      target="_blank"
      rel="noopener noreferrer">
      <img
        class="logo"
        src={heroMinaLogo}
        alt="Mina Logo"
        width="191"
        height="174"
        priority />
    </a>
    <p class="tagline">
      built with
      <code class="code">o1js</code>
    </p>
  </div>
  {#await zkApp}
    loading Resume...
  {:then zkResume}
    <UiResume {zkResume}></UiResume>
  {/await}
  <p class="start">
    Get started by editing
    <code class="code">src/routes/+page.svelte</code>
  </p>
  <div class="grid">
    <a
      href="https://docs.minaprotocol.com/zkapps"
      class="card"
      target="_blank"
      rel="noopener noreferrer">
      <h2>
        <span>DOCS</span>
        <div>
          <img
            src={arrowRightSmall}
            alt="Mina Logo"
            width={16}
            height={16}
            priority />
        </div>
      </h2>
      <p>Explore zkApps, how to build one, and in-depth references</p>
    </a>
    <a
      href="https://docs.minaprotocol.com/zkapps/tutorials/hello-world"
      class="card"
      target="_blank"
      rel="noopener noreferrer">
      <h2>
        <span>TUTORIALS</span>
        <div>
          <img
            src={arrowRightSmall}
            alt="Mina Logo"
            width={16}
            height={16}
            priority />
        </div>
      </h2>
      <p>Learn with step-by-step o1js tutorials</p>
    </a>
    <a
      href="https://discord.gg/minaprotocol"
      class="card"
      target="_blank"
      rel="noopener noreferrer">
      <h2>
        <span>QUESTIONS</span>
        <div>
          <img
            src={arrowRightSmall}
            alt="Mina Logo"
            width={16}
            height={16}
            priority />
        </div>
      </h2>
      <p>Ask questions on our Discord server</p>
    </a>
    <a
      href="https://docs.minaprotocol.com/zkapps/how-to-deploy-a-zkapp"
      class="card"
      target="_blank"
      rel="noopener noreferrer">
      <h2>
        <span>DEPLOY</span>
        <div>
          <img
            src={arrowRightSmall}
            alt="Mina Logo"
            width={16}
            height={16}
            priority />
        </div>
      </h2>
      <p>Deploy a zkApp to Testnet</p>
    </a>
  </div>
</main>
