///<reference path="./typings/index.d.ts"/>
import * as assert from 'assert';
export * from './spec';
import * as spec from './spec';

import {Node} from './node';
import {RawNode, RawBuilder} from './raw';
import {ValueNode, ValueBuilder} from './value';
import * as expr from './expr';
import {RawBuilderInterface} from "./spec";
import {ValueBuilderInterface} from "./spec";
import {ExprBuilderInterface} from "./spec";


export class JoinNode extends Node {

    constructor(type: spec.JoinType, source: BaseSelectNode | RawNode | string, alias?: string) {
        super();
        this.joinType = type;
        this.source = source;
        this.alias = alias
    }
    joinType: spec.JoinType;
    source: BaseSelectNode | RawNode | string;
    alias?: string | null;
    joinCondition?: expr.ExprNode | RawNode;

    buildSQL(segments: string[], opt :spec.QueryBuilderOptions) {
        switch(this.joinType) {
            case spec.JoinType.INNER_JOIN:
                segments.push('INNER JOIN')
                break;
            case spec.JoinType.LEFT_JOIN:
                segments.push('LEFT JOIN');
                break;
            case spec.JoinType.RIGHT_JOIN:
                segments.push('RIGHT JOIN');
                break;
            case spec.JoinType.OUTER_JOIN:
                segments.push('OUTER JOIN');
                break;
            default:
                throw new assert.AssertionError('dead path');
        }
        if (typeof this.source === 'string') {
            segments.push(opt.escapeIdentifier(this.source));
            if (this.alias != null)
                segments.push(opt.escapeIdentifier(this.alias));
        } else {
            if (this.alias == null) throw new Error('alias is required');
            this.source.buildSQL(segments, opt);
            segments.push(opt.escapeIdentifier(this.alias));
        }

    }
}

export class FromNode extends Node {
    constructor(source: BaseSelectNode | string | RawNode, alias?: string) {
        super();
        this.source = source;
        this.alias = alias
    }
    source: BaseSelectNode | RawNode| string;
    alias: string | null;
    joinNodes: JoinNode[] = [];

    join(node: JoinNode) {
        this.joinNodes.push(node);
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('FROM');
        if (this.source instanceof Node) {
            assert(this.alias != null, 'alias name required');
            this.source.buildSQL(segments, opt);
            segments.push(this.alias);
        } else {
            segments.push(opt.escapeIdentifier(this.source));
        }
        this.joinNodes.forEach((x)=> x.buildSQL(segments, opt));
    }
}


export class SelectColumnsNode extends Node {
    column: string | Node;
    aliasName?: string;
    constructor(column: string | spec.BearerSelectColumnType, alias?:string) {
        super();
        if (typeof column === 'string')
            this.column = column;
        else if (column instanceof SelectBuilder || column instanceof BearerSelectBuilder) {
            this.column = column.selectNode;
        } else if (column instanceof ValueBuilder)
            this.column = column.valueNode;
        else if (column instanceof RawBuilder)
            this.column = column.node;
        else
            throw new TypeError('Unrecognized builder');
        this.aliasName = alias;
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        if (typeof this.column === 'string') {
            segments.push(opt.escapeIdentifier(this.column));
        } else if (this.column instanceof BaseSelectNode) {
            segments.push('(');
            this.column.buildSQL(segments, opt);
            segments.push(')');
        } else {
            this.column.buildSQL(segments, opt);
        }
        if (this.aliasName != null) {
            segments.push('AS');
            segments.push(opt.escapeIdentifier(this.aliasName));
        }
    }
}

export class OrderColumnNode extends Node {
    by: string | expr.ExprNode | RawNode
    ascending: boolean = true;


    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        throw new Error('Unimplemented');
    }
}


export abstract class BaseSelectNode extends Node {

}

export class BearerSelectNode extends BaseSelectNode {

    columns: SelectColumnsNode[] = [];
    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('SELECT');
        if (this.columns.length == 0) {
            throw new Error('Nothing to select');
        } else {
            this.columns.forEach(x => x.buildSQL(segments, opt));
        }
    }
}

export class SelectNode extends BaseSelectNode{

    columns: SelectColumnsNode[] = [];
    fromNode: FromNode | null;
    whereNode: expr.ExprNode | null;

    constructor(from: FromNode, columns?: SelectColumnsNode[]) {
        super();
        this.fromNode = from;
        this.columns = columns || this.columns;
    }


    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('SELECT');
        if (this.columns.length == 0) {
            segments.push('*');
        } else {
            this.columns.map((x, i)=> {
                if (i > 0) segments.push(',');
                x.buildSQL(segments, opt);
            });
        }
        if (this.fromNode)
            this.fromNode.buildSQL(segments, opt);
        if (this.whereNode) {
            segments.push('WHERE');
            this.whereNode.buildSQL(segments, opt);
        }
    }
}


export class BearerSelectBuilder extends spec.Builder implements spec.BearerSelectBuilderInterface {
    selectNode: BearerSelectNode;

    constructor(selectNode: BearerSelectNode) {
        super();
        this.selectNode = selectNode;
    }

    from(table: string | spec.BearerSelectBuilderInterface | spec.SelectBuilderInterface, alias?: string): SelectBuilder {
        if (table instanceof BearerSelectBuilder || table instanceof SelectBuilder) {
            if (alias == null) throw new Error('alias required');
            return new SelectBuilder(new SelectNode(new FromNode(table.selectNode, alias), this.selectNode.columns));
        } else {
            return new SelectBuilder(new SelectNode(new FromNode(table, alias)));
        }
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        this.selectNode.buildSQL(segments, opt);
    }

    expr(ex: spec.BearerSelectColumnType, alias?: string): spec.BearerSelectBuilderInterface {
        this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        return this;
    }
}

export class SelectBuilder extends spec.Builder implements spec.SelectBuilderInterface {

    selectNode: SelectNode = null;

    constructor(node: SelectNode) {
        super();
        this.selectNode = node;
    }

    field(columnName: string, aliasName?: string): this {
        this.selectNode.columns.push(new SelectColumnsNode(columnName, aliasName));
        return this;
    }

    public where(): spec.SelectConditionExprBuilderInterface {
        return new SelectWhereBuilder(this.selectNode);
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        this.selectNode.buildSQL(segments, opt);
    }

    expr(ex: spec.BearerSelectColumnType, alias?: string): spec.SelectBuilderInterface {
        this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        return this;
    }


    innerJoin(table: string | spec.SelectBuilderInterface | spec.BearerSelectBuilderInterface, aliasName?: string): spec.SelectJoinBuilderInterface{
        return null;
    }

    outerJoin(tableName: string | spec.SelectBuilderInterface, aliasName?: string): spec.SelectJoinBuilderInterface {
        return null;
    }

    leftJoin(tableName: string | spec.SelectBuilderInterface, aliasName?: string): spec.SelectJoinBuilderInterface{
        return null;
    }

    rightJoin(tableName: string | spec.SelectBuilderInterface, aliasName?: string): spec.SelectJoinBuilderInterface{
        return null;
    }


    group(columnName: string | spec.ExprBuilderInterface ): spec.SelectGroupingBuilderInterface {
        return null;
    }

    having(expr: spec.ExprBuilderInterface): spec.SelectHavingExprBuilderInterface {
        return null;
    }
}

enum ExprRelation {
    AND,
    OR
};

export class SelectWhereBuilder
extends SelectBuilder
implements spec.SelectConditionExprBuilderInterface, spec.SelectConditionBuilderInterface {

    private nextExprRelation: ExprRelation = ExprRelation.AND;

    constructor(node: SelectNode) {
        super(node);
    }

    eq(lhs: string | ExprBuilderInterface | RawBuilderInterface | ValueBuilderInterface,
        rhs: string | ExprBuilderInterface | RawBuilderInterface | ValueBuilderInterface): this {

        let lhsNode: expr.ExprNode, rhsNode: expr.ExprNode = null;

        if (typeof lhs === 'string') lhsNode = new expr.ColumnExprNode(lhs);
        else if (lhs instanceof RawBuilder) lhsNode = new expr.RawExprNode(lhs.node);
        else if (lhs instanceof ValueBuilder) lhsNode = new expr.ValueExprNode(lhs.valueNode);
        else throw new Error('Unrecognized type');


        if (typeof rhs === 'string') rhsNode = new expr.ColumnExprNode(rhs);
        else if (rhs instanceof RawBuilder) rhsNode = new expr.RawExprNode(rhs.node);
        else if (rhs instanceof ValueBuilder) rhsNode = new expr.ValueExprNode(rhs.valueNode);
        else throw new Error('Unrecognized type');

        let node = new expr.EqualsExprNode(lhsNode, rhsNode);
        if (this.selectNode.whereNode == null)
            this.selectNode.whereNode = node;
        else if (this.nextExprRelation == ExprRelation.AND)
            this.selectNode.whereNode = new expr.AndExprNode(this.selectNode.whereNode, node);
        else
            this.selectNode.whereNode = new expr.OrExprNode(this.selectNode.whereNode, node);

        return this;
    }

    gt(): this {
        return this;
    }

    lt(): this {
        return this;
    }

    ne(): this {
        return this;
    }

    nil(): this {
        return this;
    }

    between(): this {
        return this;
    }

    in(): this {
        return this;
    }

    not(): this {
        return this;
    }

    and(): this {
        this.nextExprRelation = ExprRelation.AND;
        return this;
    }

    or(): this {
        this.nextExprRelation = ExprRelation.OR;
        return this;
    }
}

export class QueryBuilderFactory {

    private options: spec.QueryBuilderOptions | null;

    constructor(options?: spec.QueryBuilderOptions) {
        this.options = options;
    }

    public select(): spec.BearerSelectBuilderInterface {
        return new BearerSelectBuilder(new BearerSelectNode());
    }

    public value(value: any): spec.BuilderInterface {
        return new ValueBuilder(value);
    }

    public raw(rawString: any) :spec.BuilderInterface {
        return new RawBuilder(rawString);
    }
}
