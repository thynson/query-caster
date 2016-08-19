
export interface QueryBuilderOptions {
    formatValue(value: any ): string;
    escapeTableName(tableName: string):string;
}


export enum JoinType{
    INNER_JOIN,
    LEFT_JOIN,
    RIGHT_JOIN,
    OUTER_JOIN
}

export interface ConditionBuilderTemplate<T> {
    and(): T;
    or(): T;
}

export interface ConditionExprBuilderTemplate<T> {
    eq(): T;
    gt(): T;
    lt(): T;
    ne(): T;
    nil(): T;
    between(): T;
    in(): T;
    not(): this;
}

export interface ExprBuilderInterface {

}

export interface BearerSelectBuilderInterface {

    expr(ex: ExprBuilderInterface, alias?: string): BearerSelectBuilderInterface;
}


export interface SelectBuilderInterface extends BearerSelectBuilderInterface {
    field(columnName: string, aliasName?: string): SelectBuilderInterface;
    expr(ex: ExprBuilderInterface, alias?: string): SelectBuilderInterface;
    expr(ex: SelectBuilderInterface, alias?: string): SelectBuilderInterface;
    where(): SelectConditionExprBuilderInterface;
    join(table: string | SelectBuilderInterface, aliasName?: string): SelectJoinBuilderInterface;
    // join(sb: SelectBuilderInterface, aliasName: string): SelectJoinBuilderInterface;
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