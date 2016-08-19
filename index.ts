///<reference path="./typings/index.d.ts"/>
import * as assert from 'assert';
export * from './spec';
import * as spec from './spec';

import {Node} from './node';
import {RawNode} from './raw';
import {ExprNode} from './expr';


export class JoinNode extends Node {

    constructor(type: spec.JoinType, source: SelectNode | string | RawNode, alias?: string) {
        super();
        this.joinType = type;
        this.source = source;
        this.alias = alias
    }
    joinType: spec.JoinType;
    source: SelectNode | string | RawNode;
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
            segments.push(opt.escapeTableName(this.source));
            if (this.alias != null)
                segments.push(opt.escapeTableName(this.alias));
        } else {
            if (this.alias == null) throw new Error('alias is required');
            this.source.buildSQL(segments, opt);
            segments.push(opt.escapeTableName(this.alias));
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
            segments.push(opt.escapeTableName(this.source));
        }
        this.joinNodes.forEach((x)=> x.buildSQL(segments, opt));
    }
}



export class SelectColumnsNode extends Node {
    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
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

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('SELECT');
    }
}

export class SelectNode extends BaseSelectNode{

    columns: SelectColumnsNode | null;
    fromNode: FromNode | null;
    whereNode: ExprNode | null;

    getFromNode(): FromNode {
        return this.fromNode;
    }

    buildSQL(segments: string[], opt: spec.QueryBuilderOptions) {
        segments.push('SELECT');
        //if (colums == null)
        segments.push('*');
        if (this.fromNode)
            this.fromNode.buildSQL(segments, opt);
        if (this.whereNode)
            this.whereNode.buildSQL(segments, opt);
    }
}

export abstract class QueryBuilder {

    protected selectNode : BearerSelectNode;

    abstract toSQL(opt: spec.QueryBuilderOptions): string;
}

export class BearerSelectBuilder extends QueryBuilder {
    selectNode: BearerSelectNode;


    toSQL(opt: spec.QueryBuilderOptions): string {
        return null;
    }
}


export class SelectBuilder extends QueryBuilder implements spec.SelectBuilderInterface {

    selectNode: SelectNode = null;

    constructor(node: SelectNode | FromNode) {
        super();
        if (node instanceof SelectNode) {
            this.selectNode = node;
        } else {
            this.selectNode = new SelectNode();
            this.selectNode.fromNode = node;
        }
    }

    private fromTable(table) {

    }

    private ensureNode(node?: SelectNode): this {
        if (this.selectNode == null) this.selectNode = node || new SelectNode();
        return this;
    }


    field(columnName: string, aliasName?: string): this {
        return this;
    }

    public where(): spec.SelectConditionExprBuilderInterface {
        return new SelectWhereBuilder(this.selectNode);
    }

    public toSQL(options?: spec.QueryBuilderOptions):string {
        let segments: string[] = [];
        let opt: spec.QueryBuilderOptions = {
            formatValue: (x)=> x.toString(),
            escapeTableName: (x)=> `\`${x}\``
        };
        this.selectNode.buildSQL(segments, opt);
        return segments.join(' ');
    }

    expr(ex: spec.ExprBuilderInterface | spec.SelectBuilderInterface, alias?: string): spec.SelectBuilderInterface {
        return null;
    }


    join(tableName: string | spec.SelectBuilderInterface, aliasName?: string): spec.SelectJoinBuilderInterface{
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

    public selectFrom(table: string | spec.SelectBuilderInterface, alias?: string) :spec.SelectBuilderInterface {
        if (typeof table === 'string') {
            return new SelectBuilder(new FromNode(table, alias));
        } else if (table instanceof SelectBuilder || table instanceof BearerSelectBuilder) {
            return new SelectBuilder(new FromNode(table.selectNode, alias));
        } else {
            throw new TypeError('type of table is neither string nor a SelectBuilder');
        }
    }
}
