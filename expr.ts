
import {QueryBuilderOptions, Node}  from './spec';
import {RawNode} from './raw';
import {ValueNode} from './value';

export abstract class ExprNode extends Node {
}

export class ColumnExprNode extends ExprNode {
    column: string;
    constructor(column: string) {
        super();
        this.column = column;
    }
    buildSQL(segments: string[], opt: QueryBuilderOptions) {
        segments.push(opt.escapeIdentifier(this.column));
    }
}

export class ValueExprNode extends ExprNode {
    value: ValueNode;

    constructor(valueNode: ValueNode) {
        super();
        this.value = valueNode;
    }
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        this.value.buildSQL(segments, opt);
    }
}

export class RawExprNode extends ExprNode {
    rawNode: RawNode;
    constructor(rawNode: RawNode) {
        super();
        this.rawNode = rawNode;
    }
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        this.rawNode.buildSQL(segments, opt);
    }
}

export abstract class BinaryExprNode extends ExprNode {
    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    constructor(lhs: ExprNode, rhs: ExprNode) {
        super();
        this.leftHandSide = lhs;
        this.rightHandSide = rhs;
    }
}

export class EqualsExprNode extends BinaryExprNode {
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('=');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class NotEqualsExprNode extends BinaryExprNode {
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

export class GreaterExprNode extends BinaryExprNode {

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

export class GreaterEqualsExprNode extends BinaryExprNode {

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

export class LessExprNode extends BinaryExprNode {

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


export class LessEqualsExprNode extends BinaryExprNode {

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
    constructor(expr: ExprNode) {
        super();
        this.expr = expr;
    }
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.expr.buildSQL(segments, opt);
        segments.push('IS NULL');
        segments.push(')');
    }
}

export class NotExprNode extends ExprNode {
    expr: ExprNode;
    constructor(expr: ExprNode) {
        super();
        this.expr = expr;
    }
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        segments.push('NOT');
        this.expr.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class AndExprNode extends BinaryExprNode {

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
export class OrExprNode extends BinaryExprNode {

    leftHandSide: ExprNode;
    rightHandSide: ExprNode;
    buildSQL(segments: string[], opt :QueryBuilderOptions) {
        segments.push('(');
        this.leftHandSide.buildSQL(segments, opt);
        segments.push('OR');
        this.rightHandSide.buildSQL(segments, opt);
        segments.push(')');
    }
}

export class FunctionCallExprNode extends ExprNode {
    functionName: string;
    arguments: ValueNode[];
    constructor(fn: string, args: any[]) {
        super();
        this.functionName = fn;
        this.arguments = args.map(x=> new ValueNode(x));
    }
    buildSQL(segments: string[], opt: QueryBuilderOptions) {
        segments.push(opt.escapeFunction(this.functionName));
        segments.push('(');
        this.arguments.forEach((x, i)=> {
            if (i > 0) segments.push(',');
            x.buildSQL(segments, opt)
        });
        segments.push(')');
    }
}