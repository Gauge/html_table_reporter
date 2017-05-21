var assert = require('assert');
var expected, current;
before(function () {
    expected = ['a', 'b', 'c'];
})
describe('String#split', function () {
    beforeEach(function () {
        current = 'a,b,c'.split(',');
    })
    it('should return an array', function () {
        assert(Array.isArray(current));
    });
    it('should return the same array', function () {
        assert.equal(expected.length, current.length, 'arrays have equal length');
        for (var i = 0; i < expected.length; i++) {
            assert.equal(expected[i], current[i], i + 'element is equal');
        }
    })

    describe('this is a nested set of tests', function () {
        it('this is a passed test', function () {
            assert.ok(true);
        })
        it('this is a failed test', function () { 
            assert.ok(false);
        })
        it('this is a pending test')
        it('this test has logging elements', function () {
            this.log = "i am logging something here";
            assert.ok(true);
        })
        it('async test 1', function (done) { 
            var i = 0;
            while (i < 100000) { 
                i++;
            }
            assert.ok(true);
            done();
        })
    })
    describe('two suites with the same name', function() { })
    describe('two suites with the same name', function () { })

    describe('two tests with the same name', function () {
        describe('one more suite nest first', function() {
            it('same name')
            it('same name')

            it('same name and does things', function () { 
                assert.ok(true);
            })
            it('same name and does things', function () { 
                assert.ok(false);
            })
            it('async test 2', function (done) {
                var i = 0;
                while (i < 50000000) { 
                    i++;
                }
                assert.ok(true);
                done();
            })
        })
    })
})
describe('a second external suite', function () {
    it('things happend', function () { 
        assert.ok(true);
    })
})
describe('an empty suite', function () { })
