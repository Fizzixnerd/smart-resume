import { SmartContract, state, State, method, CircuitString, PublicKey, PrivateKey, Bool, assert } from 'o1js';

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
  statementString: CircuitString;
  @state(PublicKey) claimant = State<PublicKey>();
  @state(PublicKey) signer = State<PublicKey>();
  @state(CircuitString) statement = State<CircuitString>();
  @state(Bool) claimantSigned = State<Bool>();
  @state(Bool) signerSigned = State<Bool>();
  @state(Bool) claimantRevoked = State<Bool>();
  @state(Bool) signerRevoked = State<Bool>();

  constructor(appAddress: PublicKey, claimantAddress: PublicKey, signerAddress: PublicKey, statementString: CircuitString) {
    super(appAddress);
    this.claimantAddress = claimantAddress;
    this.signerAddress = signerAddress;
    this.statementString = statementString;
  }

  init() {
    super.init();
    this.claimant.set(this.claimantAddress);
    this.signer.set(this.signerAddress);
    this.statement.set(this.statementString);
    this.claimantSigned.set(Bool(false));
    this.signerSigned.set(Bool(false));
    this.claimantRevoked.set(Bool(false));
    this.signerRevoked.set(Bool(false));

  }

  @method async claimantAgree(potentialClaimant: PrivateKey) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    if (currentSignState.not()) {
      // Hasn't been signed yet, so check if we are allowed to sign.
      potentialClaimant.toPublicKey().assertEquals(claimant);
      this.claimantSigned.set(Bool(true));
    } else {
      // No change
      return;
    }
  }

  @method async claimantRevoke(potentialClaimant: PrivateKey) {
    const currentSignState = this.claimantSigned.getAndRequireEquals();
    const currentRevokedState = this.claimantRevoked.getAndRequireEquals();
    const claimant = this.claimant.getAndRequireEquals();
    if (currentSignState.and(currentRevokedState.not())) {
      // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
      potentialClaimant.toPublicKey().assertEquals(claimant);
      this.claimantRevoked.set(Bool(true));
    } else {
      // No change
      return;
    }
  }

  @method async signerAgree(potentialSigner: PrivateKey) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    if (currentSignState.not()) {
      // Hasn't been signed yet, so check if we are allowed to sign.
      potentialSigner.toPublicKey().assertEquals(signer);
      this.signerSigned.set(Bool(true));
    } else {
      // No change
      return;
    }
  }

  @method async signerRevoke(potentialSigner: PrivateKey) {
    const currentSignState = this.signerSigned.getAndRequireEquals();
    const currentRevokedState = this.signerRevoked.getAndRequireEquals();
    const signer = this.signer.getAndRequireEquals();
    if (currentSignState.and(currentRevokedState.not())) {
      // Hasn't been revoked yet, but has been signed, so check if we are allowed to revoke.
      potentialSigner.toPublicKey().assertEquals(signer);
      this.signerRevoked.set(Bool(true));
    } else {
      // No change
      return;
    }
  }
}
