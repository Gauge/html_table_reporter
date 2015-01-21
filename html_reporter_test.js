var assert = require('assert');
var Mocha = require('mocha');
var Test = Mocha.Test;
var Suite = Mocha.Suite;

var mocha = new Mocha({
    reporter: 'html_table_reporter',
    timeout: 15000,
    slow: 200,
    bail: false
});

var suite1 = Suite.create(mocha.suite, 'HTML Test Suite');

suite1.addTest(new Test('2 + 2 will equal 4', function() {
    assert.equal(2 + 2, 4, '2+2 did not equal 4!');
}));

suite1.addTest(new Test('4 will equal 87', function() {
    assert.equal(4, 87, '4 did not equal 87');
}));

suite1.addTest(new Test('this is a pending test'));



var suite2 = Suite.create(suite1, 'Sub Test Suite 1');

suite2.addTest(new Test('text is "green"', function() {
    this.log = "i am a chunck'o'logged text. This is what happens when i add a new line\n\nI should be two lines down";
    assert.equal('green', 'green', 'green was not given correctly');
}));

suite2.addTest(new Test('test is true', function() {
    assert(false);
}));

var suiteSample = Suite.create(suite1, 'Sub Test Suite 2');

suiteSample.addTest(new Test('text is "green"', function() {
    assert.equal('green', 'green', 'green was not given correctly');
}));

var suite3 = Suite.create(suite2, 'No Test In This');
var suite4 = Suite.create(suite3, 'Sub Sub Sub');

suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));
suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));
suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));
suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));
suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));
suite4.addTest(new Test('inner pass', function() {
    assert(true);
}));

suite4.addTest(new Test('inner fail', function() {
    assert(false);
}));

var suite5 = Suite.create(mocha.suite, 'Another Suite');

suite5.addTest(new Test('this tests is awesome', function() {
    assert(true);
}));

suite5.addTest(new Test('really really really really really really really really really really really really really really really really really really really really really really really really really really really really really long', function() {
    assert(true);
}));

suite5.addTest(new Test('long text fail', function() {
    assert.equal(true, false, "Men of all sorts take a pride to gird at me: the brain of this foolish-compounded clay, man, is not" +
        "able to invent anything that tends to laughter, more than I invent or is invented on me: I am not only" +
        "witty in myself, but the cause that wit is in other men. I do here walk before thee like a sow that hath overwhelmed all her litter but one. If the" +
        "prince put thee into my service for any other reason than to set me off, why then I have no judgment. Thou whoreson mandrake, thou art fitter to be worn" +
        "in my cap than to wait at my heels. I was never manned with an agate till now: but I will inset you neither in gold nor silver, but in vile apparel, and" +
        "send you back again to your master, for a jewel,-- the juvenal, the prince your master, whose chin is not yet fledged. I will sooner have a beard grow in" +
        "the palm of my hand than he shall get one on his cheek; and yet he will not stick to say his face is a face-royal: God may finish it when he will, 'tis" +
        "not a hair amiss yet: he may keep it still at a face-royal, for a barber shall never earn sixpence out of it; and yet he'll be crowing as if he had" +
        "writ man ever since his father was a bachelor. He may keep his own grace, but he's almost out of mine, I can assure him. What said Master Dombledon about" +
        "the satin for my short cloak and my slops?");
}));

suite5.addTest(new Test('another failed test', function() {
    assert(false);
}));

var suite6 = Suite.create(suite5, 'just because');
suite6.addTest(new Test('this tests is awesome', function() {
    assert(true);
}));

var suite7 = Suite.create(mocha.suite, 'This Suite Will Not Show Up');

mocha.run();
