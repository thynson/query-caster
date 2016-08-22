import * as spec  from './spec';
import {Node} from './node';

export class ValueNode extends Node {
    value: any;
    constructor(value: any) {
        super();
        this.value = value;
    }

    buildSQL(segment: string[], opt: spec.QueryBuilderOptions) {
        segment.push(opt.escapeValue(this.value));
    }
}

export class ValueBuilder extends spec.Builder implements spec.BuilderInterface {

    valueNode: ValueNode | string;
    constructor(rawNode: ValueNode | string) {
        super();
        this.valueNode = rawNode;
    }

    buildSQL(segments: string[], options: spec.QueryBuilderOptions) {
        if (this.valueNode instanceof ValueNode) {
            this.valueNode.buildSQL(segments, options);
        } else {
            segments.push(this.valueNode);
        }
    }

}