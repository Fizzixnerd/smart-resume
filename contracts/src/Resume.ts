import { Bool, method, PublicKey, SmartContract } from "o1js";
import { RevokableAgreement } from "./Agreement";

export class Resume extends SmartContract {
    statements: RevokableAgreement[];
    subsections: Resume[];

    constructor(appAddress: PublicKey, statements: RevokableAgreement[], subsections: Resume[]) {
        super(appAddress);
        this.statements = statements;
        this.subsections = subsections;
    }

    public claimants(): PublicKey[] {
        return this.statements.map(s => s.claimant.getAndRequireEquals()).concat(...this.subsections.map(x => x.claimants()));
    }

    public signers(): PublicKey[] {
        return this.statements.map(s => s.signer.getAndRequireEquals()).concat(...this.subsections.map(x => x.signers()));
    }

    @method.returns(Bool) async areAllInEffect(): Promise<Bool> {
        return (await Promise.all(this.statements.map(s => s.isInEffect())))
            .reduce((acc, x) => acc.and(x), Bool(true))
            .and((await Promise.all(this.subsections.map(s => s.areAllInEffect())))
                .reduce((acc, x) => acc.and(x), Bool(true)));
    }

    @method async assertAreAllInEffect() {
        (await this.areAllInEffect()).assertTrue();
    }
}