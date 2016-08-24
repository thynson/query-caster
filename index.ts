///<reference path="./typings/index.d.ts"/>
import * as assert from 'assert';
export * from './spec';
import * as spec from './spec';

import {RawNode, RawBuilder} from './raw';
import {ValueNode, ValueBuilder} from './value';
import * as expr from './expr';
import {QueryBuilderOptions} from "./spec";


class JoinNode extends spec.Node {

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

class FromNode extends spec.Node {
    constructor(source: BaseSelectNode | string | RawNode, alias?: string) {
        super();
        this.source = source;
        this.alias = alias
    }
    source: spec.Node | string;
    alias: string | null;
    joinNodes: JoinNode[] = [];

    join(node: JoinNode) {
        this.joinNodes.push(node);
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('FROM');
        if (this.source instanceof spec.Node) {
            assert(this.alias != null, 'alias name required');
            this.source.buildSQL(segments, opt);
            segments.push(this.alias);
        } else {
            segments.push(opt.escapeIdentifier(this.source));
        }
        this.joinNodes.forEach((x)=> x.buildSQL(segments, opt));
    }
}


class SelectColumnsNode extends spec.Node {
    column: string | spec.Node;
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

class OrderColumnNode extends spec.Node {
    by: string | expr.ExprNode | RawNode
    ascending: boolean = true;


    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        throw new Error('Unimplemented');
    }
}


abstract class BaseSelectNode extends spec.Node {

}

class BearerSelectNode extends BaseSelectNode {

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

class SelectNode extends BaseSelectNode{

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


class BearerSelectBuilder extends spec.Builder implements spec.BearerSelectBuilderInterface {
    selectNode: BearerSelectNode;

    constructor(selectNode: BearerSelectNode) {
        super();
        this.selectNode = selectNode;
    }

    from(table: string | spec.BearerSelectBuilderInterface | spec.SelectBuilderInterface, alias?: string): SelectBuilder {
        if (table instanceof BearerSelectBuilder || table instanceof SelectBuilder) {
            if (alias == null) throw new Error('alias required');
            return new SelectBuilder(new SelectNode(new FromNode(table.getNode(), alias), this.selectNode.columns));
        } else if (typeof table === 'string') {
            return new SelectBuilder(new SelectNode(new FromNode(table, alias)));
        } else {
            throw new TypeError('invalid table');
        }
    }


    getNode(): BaseSelectNode {
        return this.selectNode;
    }

    expr(ex: spec.BearerSelectColumnType, alias?: string): spec.BearerSelectBuilderInterface {
        this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        return this;
    }
}

class SelectBuilder extends spec.Builder implements spec.SelectBuilderInterface {

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

    getNode(): SelectNode {
        return this.selectNode;
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
}

class SelectWhereBuilder
extends SelectBuilder
implements spec.SelectConditionExprBuilderInterface, spec.SelectConditionBuilderInterface {

    private nextExprRelation: ExprRelation = ExprRelation.AND;

    constructor(node: SelectNode) {
        super(node);
    }

    private _append(node) {

        if (this.selectNode.whereNode == null)
            this.selectNode.whereNode = node;
        else if (this.nextExprRelation == ExprRelation.AND)
            this.selectNode.whereNode = new expr.AndExprNode(this.selectNode.whereNode, node);
        else
            this.selectNode.whereNode = new expr.OrExprNode(this.selectNode.whereNode, node);

    }

    eq(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.EqualsExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));
        return this;
    }
    ne(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.NotEqualsExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));
        return this;
    }
    gt(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.GreaterExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));
        return this;
    }
    lt(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.LessExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));
        return this;
    }
    ge(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.GreaterEqualsExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));

        return this;
    }
    le(lhs: spec.ExprType, rhs: spec.ExprType): this {
        this._append(new expr.LessEqualsExprNode(expr.asExprNode(lhs), expr.asExprNode(rhs)));
        return this;
    }
    nil(ex: spec.ExprType): this {
        this._append(new expr.IsNullExprNode(expr.asExprNode(ex)));
        return this;

    }

    call(fn: string, ...args:spec.ExprType[]):this {
        this._append(new expr.FunctionCallExprNode(fn, args));
        return this;
    }

    not(ex: spec.ExprType): this {
        this._append(new expr.NotExprNode(expr.asExprNode(ex)));
        return this;
    }

    between(): this {
        return this;
    }

    in(): this {
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
function QueryCaster(value: spec.ValueType) : spec.ValueBuilderInterface;
function QueryCaster() : spec.BearerExprBuilderInterface;


function QueryCaster(value?: spec.ValueType) : spec.ValueBuilderInterface | spec.BearerExprBuilderInterface {
    if (value == null) return new expr.BearerExprBuilder();
    return new ValueBuilder(value);
}

namespace QueryCaster {

    export function select(): spec.BearerSelectBuilderInterface {
        return new BearerSelectBuilder(new BearerSelectNode());
    }

    export function raw(rawString: any) :spec.BuilderInterface {
        return new RawBuilder(rawString);
    }

}

export default QueryCaster;