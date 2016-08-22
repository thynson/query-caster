
export interface QueryBuilderOptions {
    escapeValue(value: any ): string;
    escapeIdentifier(name: string):string;
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

export abstract class Builder {

    abstract buildSQL(segments: string[], options?: QueryBuilderOptions);
    toSQL(options?: QueryBuilderOptions):string {

        let segments: string[] = [];
        let opt = options || <QueryBuilderOptions> {
                escapeValue: (x)=> x.toString(),
                escapeIdentifier: (x)=> `\`${x}\``
            };
        this.buildSQL(segments, opt);
        return segments.join(' ');
    }

}

export interface BuilderInterface extends Builder {
    buildSQL(segments: string[], options?: QueryBuilderOptions);
}

export interface RawBuilderInterface extends BuilderInterface {
}

export interface ExprBuilderInterface extends BuilderInterface {
}

export interface BearerSelectBuilderInterface extends BuilderInterface {

    expr(ex: ExprBuilderInterface, alias?: string): BearerSelectBuilderInterface;
    from(tableName: string | BearerSelectBuilderInterface | SelectBuilderInterface, alias?: string): SelectBuilderInterface;
}


export interface SelectBuilderInterface extends  BuilderInterface {
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