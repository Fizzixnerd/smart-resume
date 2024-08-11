import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, CircuitString } from 'o1js';
import { RevokableAgreement, Tags } from './Agreement';
import { LongString } from './LongString';

// This is the "agreement" between claimant and signer.
const agreementText = "This statement is false.  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?  Or is it?"

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
    zkApp: RevokableAgreement<string>;

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
    zkApp = new RevokableAgreement(zkAppAddress, claimantAccount, signerAccount, Field.random(), agreementText, Tags.Text);
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
    const claimant = zkApp.claimant.getAndRequireEquals()
    const signer = zkApp.signer.getAndRequireEquals()
    const statementHash = zkApp.statementHash.getAndRequireEquals();
    const claimantSigned = zkApp.claimantSigned.getAndRequireEquals().equals(Field(0)).toBoolean();
    const signerSigned = zkApp.signerSigned.getAndRequireEquals().equals(Field(0)).toBoolean();
    expect(claimant).toEqual(claimantKey.toPublicKey());
    expect(signer).toEqual(signerKey.toPublicKey());
    expect(statementHash).toEqual(LongString.fromString(JSON.stringify(agreementText)).hashWithSalt(zkApp.salt));
    expect(statementHash).not.toEqual(LongString.fromString(JSON.stringify(agreementText + "!!!")).hashWithSalt(zkApp.salt));
    expect(claimantSigned).toBeTruthy();
    expect(signerSigned).toBeTruthy();
  });

  it('correctly updates the signing state on the `RevokableAgreement` smart contract', async () => {
    await localDeploy();

    // sign transaction
    const txn = await Mina.transaction(claimantAccount, async () => {
      await zkApp.claimantAgree(claimantKey, zkApp.salt, LongString.fromString(JSON.stringify(zkApp.statement)));
    });
    await txn.prove();
    await txn.sign([claimantKey]).send();

    const claimantSigned = zkApp.claimantSigned.get().equals(Field(1)).toBoolean();
    expect(claimantSigned).toBeTruthy();
  });
});
