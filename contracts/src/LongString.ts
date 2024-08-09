import {CircuitString, Field, Poseidon, Struct, Character} from "o1js";

export class LongString extends Struct({value: String}) {
    static fromString(x: string): LongString {
        return new LongString({value: x});
    }

    static fromCircuitString(x: CircuitString): LongString {
        return LongString.fromString(x.toString());
    }

    static empty(): LongString {
        return LongString.fromString("");
    }

    private static merge(fields: Field[]): CircuitString[] {
        const chars: Character[] = fields.map(field => new Character(field))
        let strings = [];
        let string = CircuitString.fromString("");
        const n = 127;
        let i = 0;
        for (const char of chars) {
            string.append(CircuitString.fromCharacters([char]));
            i++;
            if (i === n) {
                i = 0;
                strings.push(string);
                string = CircuitString.fromString("");
            }
        }
        return strings;
    }

    public toCircuitStrings(): CircuitString[] {
        let cs = [];
        for (let i = 0; 127 * i < this.value.length; i++) {
            cs.push(CircuitString.fromString(this.value.substring(127 * i, 127 * (i + 1))));
        }
        return cs;
    }

    public append(other: LongString): LongString {
        return LongString.fromString(this.value + other.value);
    }

    public toFields(): Field[] {
        return this.toCircuitStrings().flatMap(CircuitString.toFields)
    }

    public fromFields(fields: Field[]): LongString {
        const strings = LongString.merge(fields);
        let ls = LongString.empty();
        for (const s of strings) {
            ls = ls.append(LongString.fromCircuitString(s));
        }
        return ls;
    }

    public toAuxiliary(_value?: LongString | undefined): any[] { return []; }

    public sizeInFields(): number {
        return this.value.length;
    }

    public toValue(_x: LongString): string {
        return this.value;
    }

    public fromValue(x: string | LongString): LongString {
        return (x instanceof LongString && x) || LongString.fromString(x);
    }

    public hashWithSalt(salt: Field): Field {
        return Poseidon.hash([salt, ...this.toFields()]);
    }
    
    public hash(): Field {
        return Poseidon.hash(this.toFields());
    }

    public check() {
        return;
    }
}
