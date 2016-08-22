import * as spec  from './spec';
import {Node} from './node';

export class RawNode extends Node {
    rawString: string;
    constructor(rawString: any) {
        super();
        this.rawString = rawString;
    }

    buildSQL(segment: string[], opt: spec.QueryBuilderOptions) {
        segment.push(this.rawString);
    }
}

export class RawBuilder extends spec.Builder implements spec.BuilderInterface {

    raw: RawNode;
    constructor(rawString:  string) {
        super();
        this.raw = new RawNode(rawString);
    }

    buildSQL(segments: string[], options: spec.QueryBuilderOptions) {
        this.raw.buildSQL(segments, options);
    }
}