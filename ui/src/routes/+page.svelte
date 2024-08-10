
<script lang="ts">
  import heroMinaLogo from '$lib/assets/hero-mina-logo.svg'
  import arrowRightSmall from '$lib/assets/arrow-right-small.svg'
  import GradientBG from './GradientBG.svelte'
  import { onMount } from 'svelte'
  import { Mina, PrivateKey, AccountUpdate } from 'o1js'
	import UiResume from '$lib/UiResume.svelte';
  import { Resume} from '../../../contracts/build/src/';
  import { RevokableAgreement } from '../../../contracts/build/src/Agreement';
  import { LongString } from '../../../contracts/build/src/LongString';

  let { promise: zkApp, resolve: resolveZkApp }: PromiseWithResolvers<Resume> = Promise.withResolvers()
  onMount(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    const [deployerAccount, claimantAccount, signerAccount] = Local.testAccounts;
    const deployerKey = deployerAccount.key;
    const claimantKey = claimantAccount.key;
    const signerKey = signerAccount.key;

    const agreementPrivateKey = PrivateKey.random();
    const agreementAddress = agreementPrivateKey.toPublicKey();

    const agreement = new RevokableAgreement(agreementAddress, claimantAccount, signerAccount, LongString.fromString("This statement is false!"))

    const resumePrivateKey = PrivateKey.random();
    const resumeAddress = resumePrivateKey.toPublicKey();

    const resume = new Resume(resumeAddress, [agreement], []);

    const txn = await Mina.transaction(deployerAccount, async () => {
      await AccountUpdate.fundNewAccount(deployerAccount, 2);
      await agreement.deploy();
      await resume.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, agreementPrivateKey, resumePrivateKey]).send();
    
    const txn2 = await Mina.transaction(deployerAccount, async () => {
      await agreement.claimantAgree(claimantKey, agreement.statement);
      await agreement.signerAgree(signerKey, agreement.statement);
    });
    await txn2.prove();
    await txn2.sign([deployerKey]).send();

    resolveZkApp(resume)
  })
</script>

<style global>
  @import '../styles/Home.module.css';
</style>

<svelte:head>
  <title>Mina zkResume UI</title>
</svelte:head>
<GradientBG>
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
</GradientBG>
