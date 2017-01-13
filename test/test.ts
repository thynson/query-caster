import * as test from 'tape';
import qc, {QueryBuilderOptions} from '../index';

let defaultOpt: QueryBuilderOptions = {
    escapeValue: x => JSON.stringify(x),
    escapeIdentifier: x => `"${x.replace(/"/g, '""')}"`,
    escapeFunction: x=>x
};

test('ExprBuilder', (t: test.Test) => {
    t.equals(qc().eq('a', 'b').toSQL(defaultOpt), '( "a" = "b" )');
    t.equals(qc().ne('a', 'b').toSQL(defaultOpt), '( "a" != "b" )');
    t.equals(qc().lt('a', 'b').toSQL(defaultOpt), '( "a" < "b" )');
    t.equals(qc().gt('a', 'b').toSQL(defaultOpt), '( "a" > "b" )');
    t.equals(qc().le('a', 'b').toSQL(defaultOpt), '( "a" <= "b" )');
    t.equals(qc().ge('a', 'b').toSQL(defaultOpt), '( "a" >= "b" )');
    t.equals(qc().call('a', 'b').toSQL(defaultOpt), 'a ( "b" )');
    t.equals(qc().nil('a').toSQL(defaultOpt), '( "a" IS NULL )');
    t.equals(qc().between('a', qc(1), qc(10)).toSQL(defaultOpt), '( "a" BETWEEN 1 AND 10 )');
    t.equals(qc().in('a', [qc(1), qc(2), qc(3)]).toSQL(defaultOpt), '( "a" IN ( 1 , 2 , 3 ) )');
    t.end();
});

test('SelectBuilder', function(t: test.Test) {
    t.equal(qc.select().expr(qc(1)).toSQL(defaultOpt),
        'SELECT 1',
        'Select immediate value');


    t.equal(qc.select().from('test').toSQL(defaultOpt),
        'SELECT * FROM "test"',
        'Select table');

    t.equal(qc.select().from('test').field('id').expr(qc(1), 'value').toSQL(defaultOpt),
        'SELECT "id" , 1 AS "value" FROM "test"',
        'Select from table with immediate value');

    t.throws(()=>qc.select().toSQL(defaultOpt), "Cannot select nothing without a table");

    t.equal(qc.select().expr(qc.select().expr(qc(1), 'id')).toSQL(defaultOpt),
        'SELECT ( SELECT 1 AS "id" )');

    t.equal(
        qc.select()
            .from('test')
            .where().eq('id', qc(1))
            .and().eq('a', 'b')
            .or().eq('timestamp', qc().call('NOW')).toSQL(defaultOpt),
        'SELECT * FROM "test" WHERE ( ( ( "id" = 1 ) AND ( "a" = "b" ) ) OR ( "timestamp" = NOW ( ) ) )');

    t.equal(
        qc.select()
            .from('test')
            .where().gt('a', 'b').or().lt('b', 'c').and().ge('c', 'd').or().le('d', 'e').toSQL(defaultOpt),
        'SELECT * FROM "test" WHERE ( ( ( ( "a" > "b" ) OR ( "b" < "c" ) ) AND ( "c" >= "d" ) ) OR ( "d" <= "e" ) )');

    t.equal(
        qc.select()
            .from('test')
            .where().call("fn", qc(1), qc(2), qc(3)).toSQL(defaultOpt),
        'SELECT * FROM "test" WHERE fn ( 1 , 2 , 3 )'
    );
    t.equal(
        qc.select().from('test').where().in('a', [qc(1), qc(2), qc(3)]).and().between('b', 'c', 'd').toSQL(defaultOpt),
        'SELECT * FROM "test" WHERE ( ( "a" IN ( 1 , 2 , 3 ) ) AND ( "b" BETWEEN "c" AND "d" ) )'
    );
    t.equal(
        qc.select().from(qc.select().expr(qc(1)), 'a').toSQL(defaultOpt),
        'SELECT * FROM ( SELECT 1 ) "a"'
    );

    t.skip('should be able to inner join');

    t.skip('should be able to inner join with condition');

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

