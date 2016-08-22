///<reference path="../typings/index.d.ts"/>
import * as qc from '../index';
import * as assert from 'assert';

let factory = new qc.QueryBuilderFactory();

describe('SelectFromBuilder', function(this: Mocha) {

    it('should be able to bearer select')

    it('should be able to select', function(this: Mocha) {
        assert.equal(factory.select().from('test').toSQL(), 'SELECT * FROM `test`');
    });

    it('should be able to join');

    it('should be able to join with condition');
});