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

    node: ValueNode;
    constructor(value: any) {
        super();
        this.node = new ValueNode(value);
    }
}