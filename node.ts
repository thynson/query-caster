
import {QueryBuilderOptions} from './spec';

export abstract class Node {
    abstract buildSQL(segments: string[], opt: QueryBuilderOptions);
}

