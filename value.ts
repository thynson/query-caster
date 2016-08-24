import * as spec  from './spec';

export class ValueNode extends spec.Node {
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

    valueNode: ValueNode;
    constructor(value: any) {
        super();
        this.valueNode = new ValueNode(value);
    }

    protected getNode(): ValueNode {
        return this.valueNode;
    }

    buildSQL(segments: string[], options: spec.QueryBuilderOptions) {
        this.valueNode.buildSQL(segments, options);
    }

}