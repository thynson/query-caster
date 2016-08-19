
import {QueryBuilderOptions}  from './spec';
import {Node} from './node';
import {RawNode} from './raw';


export abstract class ExprNode extends Node {
}

export abstract class ValueExprNode extends ExprNode {
    value: any;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push(opt.formatValue(this.value));
    }
}

export class RawExprNode extends ExprNode {
    rawNode: RawNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        this.rawNode.buildSQL(segments, opt);
    }
}

export class EqualsExprNode extends ExprNode {
    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('=');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class NotEqualsExprNode extends ExprNode {
    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('!=');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class GreaterExprNode extends ExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('>');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class GreaterEqualsExprNode extends ExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('>=');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class LessExprNode extends ExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('<');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}


export class LessEqualsExprNode extends ExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('<=');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class IsNullExprNode extends ExprNode {
    expr: ExprNode;

    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.expr.buildSQL(segments, opt);
        segments.push('IS NULL');
        segments.push(')');
    }
}

export class NotExprNode extends ExprNode {
    expr: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        segments.push('NOT');
        this.expr.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class AndExprNode extends ExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('AND');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}
