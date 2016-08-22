///<reference path="../typings/index.d.ts"/>
import * as qc from '../index';
import * as assert from 'assert';

let factory = new qc.QueryBuilderFactory();

describe('SelectBuilder', function(this: Mocha) {

    it('should be able to bearer select', function(this:Mocha) {
        assert.equal(factory.select().expr(factory.value(1)).toSQL(), 'SELECT 1');
    });

    it('should be able to select', function(this: Mocha) {
        assert.equal(factory.select().from('test').toSQL(), 'SELECT * FROM `test`');
    });

    it('should be able to join');

    it('should be able to join with condition');
});

describe('InsertBuilder', function(this: Mocha) {
    it('should be able to insert constant value');

    it('should be able to insert select');

});

describe('DeleteBuilder', function(this: Mocha) {
    it('should be able to delete all rows in a table');

    it('should be able to delete filtered rows from a table');

    it('should be able to join tables when deleting');
});


describe('UpdateBuilder', function(this: Mocha) {
    it('should be able to update all rows in a table');

    it('should be able to update filtered rows from a table');

    it('should be able to update while reference rows');
});


describe('TableBuilder', function(this: Mocha) {

    it('should be able to create table');

    it('should be able to drop table');

    it('should be able to add columns');

    it('should be able to drop columns');

    it('should be able to add index');

    it('should be able to drop index');
});

