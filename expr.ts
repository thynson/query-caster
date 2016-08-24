
import {QueryBuilderOptions, Node, BearerExprBuilderInterface, ExprType}  from './spec';
import {RawNode, RawBuilder} from './raw';
import {ValueNode, ValueBuilder} from './value';

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
    arguments: ExprNode[];
    constructor(fn: string, args: ExprType[]) {
        super();
        this.functionName = fn;
        this.arguments = args.map(asExprNode);
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

export function asExprNode(x: ExprType): ExprNode {

    if (typeof x === 'string') return new ColumnExprNode(x);
    else if (x instanceof RawBuilder) return new RawExprNode(x.node);
    else if (x instanceof ValueBuilder) return new ValueExprNode(x.valueNode);
    else throw new Error('Unrecognized type');
}

export class BearerExprBuilder implements BearerExprBuilderInterface {
    node: ExprNode;

    constructor(){

    }

    eq(lhs: ExprType, rhs: ExprType): void {
        this.node = new EqualsExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    gt(lhs: ExprType, rhs: ExprType): void {
        this.node = new GreaterExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    lt(lhs: ExprType, rhs: ExprType): void {
        this.node = new LessExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    ge(lhs: ExprType, rhs: ExprType): void {
        this.node = new GreaterEqualsExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    le(lhs: ExprType, rhs: ExprType): void {
        this.node = new LessEqualsExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    ne(lhs: ExprType, rhs: ExprType): void {
        this.node = new NotEqualsExprNode(asExprNode(lhs), asExprNode(rhs));
    }

    nil(expr: ExprType): void {
        this.node = new IsNullExprNode(asExprNode(expr));
    }

    between(): void {
    }

    in(): void {
    }

    not(expr: ExprType): this {
        return null;
    }

    call(fn: string, ...args: ExprType[]): void {
        this.node = new FunctionCallExprNode(fn, args);
    }
}