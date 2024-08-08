import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, CircuitString } from 'o1js';
import { RevokableAgreement } from './Agreement';
import { LongString } from './LongString';

// This is the "agreement" between claimant and signer.
const agreementText = "This statement is false."

/*
 * This file specifies how to test the `RevokableAgreement` smart contract.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('Agreement', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    claimantAccount: Mina.TestPublicKey,
    claimantKey: PrivateKey,
    signerAccount: Mina.TestPublicKey,
    signerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: RevokableAgreement;

  beforeAll(async () => {
    if (proofsEnabled) await RevokableAgreement.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, claimantAccount, signerAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    claimantKey = claimantAccount.key;
    signerKey = signerAccount.key;


    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new RevokableAgreement(zkAppAddress, claimantAccount, signerAccount, LongString.fromString(agreementText));
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `RevokableAgreement` smart contract', async () => {
    await localDeploy();
    const claimant = zkApp.claimant.get()
    const signer = zkApp.signer.get()
    const statementHash = zkApp.statementHash.get();
    const claimantSigned = zkApp.claimantSigned.get().toBoolean();
    const signerSigned = zkApp.signerSigned.get().toBoolean();
    const claimantRevoked = zkApp.claimantRevoked.get().toBoolean();
    const signerRevoked = zkApp.signerRevoked.get().toBoolean();
    expect(claimant).toEqual(claimantKey.toPublicKey());
    expect(signer).toEqual(signerKey.toPublicKey());
    expect(statementHash).toEqual(LongString.fromString(agreementText).hash());
    expect(claimantSigned).toBeFalsy();
    expect(signerSigned).toBeFalsy();
    expect(claimantRevoked).toBeFalsy();
    expect(signerRevoked).toBeFalsy();
  });

  it('correctly updates the signing state on the `RevokableAgreement` smart contract', async () => {
    await localDeploy();

    // sign transaction
    const txn = await Mina.transaction(claimantAccount, async () => {
      await zkApp.claimantAgree(claimantKey, LongString.fromString(agreementText));
    });
    await txn.prove();
    await txn.sign([claimantKey]).send();

    const claimantSigned = zkApp.claimantSigned.get().toBoolean();
    expect(claimantSigned).toBeTruthy();
  });
});
