import {QueryBuilderOptions}  from './spec';
import {Node} from './node';

export class RawNode extends Node {
    sql: string;
    buildSQL(segment: string[], opt: QueryBuilderOptions) {  segment.push(this.sql); }
}