import * as spec  from './spec';
import {Node} from './node';

export class RawNode extends Node {
    value: any;
    constructor(value: any) {
        super();
        this.value = value;
    }

    buildSQL(segment: string[], opt: spec.QueryBuilderOptions) {
        segment.push(opt.escapeValue(this.value));
    }
}

export class RawBuilder extends spec.Builder implements spec.BuilderInterface {

    raw: RawNode | string;
    constructor(rawNode: RawNode | string) {
        super();
        this.raw = rawNode;
    }

    buildSQL(segments: string[], options: spec.QueryBuilderOptions) {
        if (this.raw instanceof RawNode) {
            this.raw.buildSQL(segments, options);
        } else {
            segments.push(this.raw);
        }
    }

}