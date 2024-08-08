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
  @state(Bool) claimantSigned = State<Bool>();
  @state(Bool) signerSigned = State<Bool>();
  @state(Bool) claimantRevoked = State<Bool>();
  @state(Bool) signerRevoked = State<Bool>();

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
    this.claimantSigned.set(Bool(false));
    this.signerSigned.set(Bool(false));
    this.claimantRevoked.set(Bool(false));
    this.signerRevoked.set(Bool(false));
  }

  @method async claimantAgree(potentialClaimant: PrivateKey, statement: LongString) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    currentSignState.assertFalse();
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been signed yet, so check if we are allowed to sign.
    potentialClaimant.toPublicKey().assertEquals(claimant);
    this.claimantSigned.set(Bool(true));
  }

  @method async claimantRevoke(potentialClaimant: PrivateKey, statement: LongString) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const currentRevokedState = this.claimantRevoked.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    currentSignState.and(currentRevokedState.not()).assertTrue();
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
    potentialClaimant.toPublicKey().assertEquals(claimant);
    this.claimantRevoked.set(Bool(true));
  }

  @method async signerAgree(potentialSigner: PrivateKey, statement: LongString) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    currentSignState.assertFalse();
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been signed yet, so check if we are allowed to sign.
    potentialSigner.toPublicKey().assertEquals(signer);
    this.signerSigned.set(Bool(true));
  }

  @method async signerRevoke(potentialSigner: PrivateKey, statement: LongString) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const currentRevokedState = this.signerRevoked.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    currentSignState.and(currentRevokedState.not()).assertTrue();
    this.statementHash.getAndRequireEquals().assertEquals(statement.hash())
    // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
    potentialSigner.toPublicKey().assertEquals(signer);
    this.signerRevoked.set(Bool(true));
  }

  @method.returns(Bool) async isInEffect(): Promise<Bool> {
    return this.signerSigned.getAndRequireEquals()
      .and(this.claimantSigned.getAndRequireEquals())
      .and(this.claimantRevoked.getAndRequireEquals().not())
      .and(this.signerRevoked.getAndRequireEquals().not())
  }

  @method.returns(Bool) async isStatement(statement: LongString): Promise<Bool> {
    return this.statementHash.getAndRequireEquals().equals(statement.hash())
  }
}
