///<reference path="../typings/index.d.ts"/>
import * as test from 'tape';
import * as qc from '../index';

let factory = new qc.QueryBuilderFactory();
let defaultOpt: qc.QueryBuilderOptions = {
    escapeValue: x => JSON.stringify(x),
    escapeIdentifier: x => `"${x.replace(/"/g, '""')}"`
};

test('SelectBuilder', function(t: test.Test) {
    t.equal(factory.select().expr(factory.value(1)).toSQL(defaultOpt),
        'SELECT 1',
        'Select immediate value');


    t.equal(factory.select().from('test').toSQL(defaultOpt),
        'SELECT * FROM "test"',
        'Select table');

    t.equal(factory.select().from('test').field('id').expr(factory.value(1), 'value').toSQL(defaultOpt),
        'SELECT "id" , 1 AS "value" FROM "test"',
        'Select from table with immediate value');

    t.skip('should be able to join');

    t.skip('should be able to join with condition');
    t.end();
});

test.skip('InsertBuilder', function(t: test.Test) {
    t.skip('should be able to insert constant value');

    t.skip('should be able to insert select');
    t.end();

});

test('DeleteBuilder', function(t: test.Test) {
    t.skip('should be able to delete all rows in a table');

    t.skip('should be able to delete filtered rows from a table');

    t.skip('should be able to join tables when deleting');
    t.end();

});


test('UpdateBuilder', function(t: test.Test) {
    t.skip('should be able to update all rows in a table');

    t.skip('should be able to update filtered rows from a table');

    t.skip('should be able to update while reference rows');
    t.end();

});


test('TableBuilder', function(t: test.Test) {

    t.skip('should be able to create table');

    t.skip('should be able to drop table');

    t.skip('should be able to add columns');

    t.skip('should be able to drop columns');

    t.skip('should be able to add index');

    t.skip('should be able to drop index');
    t.end();

});

