import { SmartContract, state, State, method, PublicKey, PrivateKey, Bool, Field } from 'o1js';
import { LongString } from './LongString';

/**
 * See https://docs.minaprotocol.com/zkapps for more info.
 * 
 * The `RevokableAgreement` contract represents an agreement on a `statement` between two parties when deployed.  This agreement can be revoked by either party at any time.
 * When the '*Agree' methods are called, the RevokableAgreement sets the '*signed' values to 'true' if the party is allowed to sign.
 * When the '*Revoke' methods are called, the RevokableAgreement sets the '*revoked' values to true if the agreement has been signed and the party is allowed to revoke.
 */
export class RevokableAgreement extends SmartContract {
  claimantAddress : PublicKey;
  signerAddress: PublicKey;
  statement: LongString;
  @state(PublicKey) claimant = State<PublicKey>();
  @state(PublicKey) signer = State<PublicKey>();
  @state(Field) statementHash = State<Field>();
  @state(Field) claimantSigned = State<Field>();
  @state(Field) signerSigned = State<Field>();

  constructor(appAddress: PublicKey, claimantAddress: PublicKey, signerAddress: PublicKey, statement: LongString) {
    super(appAddress);
    this.claimantAddress = claimantAddress;
    this.signerAddress = signerAddress;
    this.statement = statement;
  }

  init() {
    super.init();
    this.claimant.set(this.claimantAddress);
    this.signer.set(this.signerAddress);
    this.statementHash.set(this.statement.hash());
    this.claimantSigned.set(Field(0));
    this.signerSigned.set(Field(0));
  }

  @method async claimantAgree(potentialClaimant: PrivateKey, statement: LongString) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    currentSignState.assertEquals(Field(0));
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been signed yet, so check if we are allowed to sign.
    potentialClaimant.toPublicKey().assertEquals(claimant);
    this.claimantSigned.set(Field(1));
  }

  @method async claimantRevoke(potentialClaimant: PrivateKey, statement: LongString) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    currentSignState.assertEquals(Field(1));
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
    potentialClaimant.toPublicKey().assertEquals(claimant);
    this.claimantSigned.set(Field(2))
  }

  @method async signerAgree(potentialSigner: PrivateKey, statement: LongString) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    currentSignState.assertEquals(Field(0));
    // Hasn't been signed yet, so check if we are allowed to sign.
    potentialSigner.toPublicKey().assertEquals(signer);
    this.signerSigned.set(Field(1));
  }

  @method async signerRevoke(potentialSigner: PrivateKey, statement: LongString) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    currentSignState.assertEquals(Field(1));
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
    potentialSigner.toPublicKey().assertEquals(signer);
    this.signerSigned.set(Field(2));
  }

  @method.returns(Bool) async isInEffect(): Promise<Bool> {
    return this.signerSigned.getAndRequireEquals().equals(Field(1))
      .and(this.claimantSigned.getAndRequireEquals().equals(Field(1)));
  }

  @method.returns(Bool) async isStatement(statement: LongString): Promise<Bool> {
    return this.statementHash.getAndRequireEquals().equals(statement.hash())
  }
}
