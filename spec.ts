
import {ValueBuilder} from "./value";
export interface QueryBuilderOptions {
    escapeValue(value: any ): string;
    escapeIdentifier(name: string):string;
    escapeFunction(fn: string): string;
}


export type ExprType = string | ExprBuilderInterface | RawBuilderInterface | ValueBuilderInterface;

export type ValueType
    = number    // INT/LONG/
    | boolean   // BOOLEAN
    | string    // TEXT/STRING/VARCHAR
    | Date      // DATE
    | Buffer    // BLOB
;

export enum JoinType{
    INNER_JOIN,
    LEFT_JOIN,
    RIGHT_JOIN,
    OUTER_JOIN
}

export interface ConditionBuilderTemplate<T> extends BuilderInterface {
    and(): T;
    or(): T;
}

export interface ConditionExprBuilderTemplate<T> {
    eq(lhs: ExprType, rhs: ExprType): T;
    gt(lhs: ExprType, rhs: ExprType): T;
    lt(lhs: ExprType, rhs: ExprType): T;
    ge(lhs: ExprType, rhs: ExprType): T;
    le(lhs: ExprType, rhs: ExprType): T;
    ne(lhs: ExprType, rhs: ExprType): T;
    nil(expr: ExprType): T;
    between(): T;
    in(): T;
    not(expr: ExprType): this;
    call(fn: string, ...args:ExprType[]): T;
}

export abstract class Node {
    abstract buildSQL(segments: string[], opt: QueryBuilderOptions);
}


export abstract class Builder {

    protected abstract getNode():Node;

    toSQL(opt: QueryBuilderOptions):string {
        let segments: string[] = [];
        this.getNode().buildSQL(segments, opt);
        return segments.join(' ');
    }
}

export interface ExprBuilderInterface extends Builder, ConditionExprBuilderTemplate<Builder> {
}

export interface BuilderInterface extends Builder {
}

export interface RawBuilderInterface extends BuilderInterface {
}

export interface ValueBuilderInterface extends BuilderInterface {
}

export type BearerSelectColumnType = RawBuilderInterface | ExprBuilderInterface | ValueBuilderInterface;

export interface BearerSelectBuilderInterface extends BuilderInterface {
    expr(ex: BearerSelectColumnType, alias?: string): BearerSelectBuilderInterface;
    from(tableName: string | BearerSelectBuilderInterface | SelectBuilderInterface, alias?: string): SelectBuilderInterface;
}


export interface SelectBuilderInterface extends  BuilderInterface {
    field(columnName: string, aliasName?: string): SelectBuilderInterface;
    expr(ex: BearerSelectColumnType, alias?: string): SelectBuilderInterface;
    where(): SelectConditionExprBuilderInterface;
    innerJoin(table: string | SelectBuilderInterface, aliasName?: string): SelectJoinBuilderInterface;
    leftJoin(table: string | SelectBuilderInterface, aliasName?: string): SelectJoinBuilderInterface;
    rightJoin(table: string | SelectBuilderInterface, aliasName?: string): SelectJoinBuilderInterface;
    outerJoin(table: string | SelectBuilderInterface, aliasName?: string): SelectJoinBuilderInterface;
    group(columnName: string): SelectGroupingBuilderInterface;
    group(expr: ExprBuilderInterface): SelectGroupingBuilderInterface;
    having(expr: ExprBuilderInterface): SelectHavingExprBuilderInterface;
}


export interface SelectJoinConditionBuilderInterface
    extends ConditionBuilderTemplate<SelectJoinExprBuilderInterface> { }

export interface SelectJoinExprBuilderInterface
    extends ConditionExprBuilderTemplate<SelectJoinConditionBuilderInterface> { }

export interface SelectJoinBuilderInterface extends SelectBuilderInterface {
    on(): SelectJoinExprBuilderInterface
}

export interface SelectConditionBuilderInterface
    extends ConditionBuilderTemplate<SelectConditionExprBuilderInterface> { }

export interface SelectConditionExprBuilderInterface
    extends ConditionExprBuilderTemplate<SelectConditionBuilderInterface> { }


export interface SelectGroupingBuilderInterface {
    // TODO: How to define ?
    group(): SelectGroupingBuilderInterface
}

export interface SelectHavingConditionBuilderInterface
    extends ConditionExprBuilderTemplate<SelectHavingExprBuilderInterface> { }

export interface SelectHavingExprBuilderInterface
    extends ConditionExprBuilderTemplate<SelectHavingConditionBuilderInterface> { }