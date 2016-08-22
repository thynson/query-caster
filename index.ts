///<reference path="./typings/index.d.ts"/>
import * as assert from 'assert';
export * from './spec';
import * as spec from './spec';

import {Node} from './node';
import {RawNode, RawBuilder} from './raw';
import {ExprNode} from './expr';


export class JoinNode extends Node {

    constructor(type: spec.JoinType, source: BearerSelectBuilder | SelectBuilder | string | RawBuilder, alias?: string) {
        super();
        this.joinType = type;
        this.source = source;
        this.alias = alias
    }
    joinType: spec.JoinType;
    source: BearerSelectBuilder | SelectBuilder | string | RawBuilder;
    alias?: string | null;
    joinCondition?: ExprNode | RawNode;

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
    column: string | RawBuilder | SelectBuilder | BearerSelectBuilder;
    aliasName?: string;
    constructor(columnName: string | RawBuilder | SelectBuilder | BearerSelectBuilder, aliasName?:string) {
        super();
        this.column = columnName;
        this.aliasName = aliasName;
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        if (this.column instanceof RawBuilder) {
            this.column.buildSQL(segments, opt);
        } else if (this.column instanceof SelectBuilder || this.column instanceof BearerSelectBuilder) {
            segments.push('(');
            this.column.buildSQL(segments, opt);
            segments.push(')');
        } else {
            segments.push(opt.escapeIdentifier(this.column));
        }
        if (this.aliasName != null) {
            segments.push('AS');
            segments.push(opt.escapeIdentifier(this.aliasName));
        }
    }
}

export class OrderColumnNode extends Node {
    by: string | ExprNode | RawNode
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
    whereNode: ExprNode | null;

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
        if (this.whereNode)
            this.whereNode.buildSQL(segments, opt);
    }
}


export class BearerSelectBuilder extends spec.Builder implements spec.BearerSelectBuilderInterface {
    selectNode: BearerSelectNode;

    constructor(selectNode: BearerSelectNode) {
        super();
        this.selectNode = selectNode;
    }

    from(table: string | spec.BearerSelectBuilderInterface | spec.SelectBuilderInterface, alias?: string): SelectBuilder {
        if (table instanceof BearerSelectBuilder) {
            if (alias == null) throw new Error('alias required');
            return new SelectBuilder(new SelectNode(new FromNode(table.selectNode), this.selectNode.columns));
        } else if (table instanceof SelectBuilder) {
            if (alias == null) throw new Error('alias required');
            return new SelectBuilder(new SelectNode(new FromNode(table.selectNode), this.selectNode.columns));
        } else {
            return new SelectBuilder(new FromNode(table));
        }
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        this.selectNode.buildSQL(segments, opt);
    }

    expr(ex: spec.ExprBuilderInterface | spec.RawBuilderInterface | spec.SelectBuilderInterface, alias?: string): spec.BearerSelectBuilderInterface {
        if (ex instanceof RawBuilder) {
            this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        } if (ex instanceof SelectBuilder || ex instanceof BearerSelectBuilder) {
            this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        }
        return this;
    }
}

export class SelectBuilder extends spec.Builder implements spec.SelectBuilderInterface {

    selectNode: SelectNode = null;

    constructor(node: SelectNode | FromNode) {
        super();
        if (node instanceof SelectNode) {
            this.selectNode = node;
        } else {
            this.selectNode = new SelectNode(node);
        }
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

    expr(ex: spec.ExprBuilderInterface | spec.SelectBuilderInterface, alias?: string): spec.SelectBuilderInterface {
        if (ex instanceof RawBuilder) {
            this.selectNode.columns.push(new SelectColumnsNode(ex, alias));
        }
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

export class SelectWhereBuilder
extends SelectBuilder
implements spec.SelectConditionExprBuilderInterface, spec.SelectConditionBuilderInterface {


    constructor(node: SelectNode) {
        super(node);
    }

    eq(): this {
        return null;
    }

    gt(): this {
        return null;
    }

    lt(): this {
        return null;
    }

    ne(): this {
        return null;
    }

    nil(): this {
        return null;
    }

    between(): this {
        return null;
    }

    in(): this {
        return null;
    }

    not(): this {
        return null;
    }

    and(): this {
        return null;
    }

    or(): this {
        return null;
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

    public value(value: any): spec.RawBuilderInterface {
        return new RawBuilder(value);
    }
}
