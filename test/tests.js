QUnit.test('WP.isAlpha', function (assert) {
	var strAlpha = 'abcd';
	var strCapitalAlpha = 'ABCD';
	var strNonAlpha = 'abcd123';
	var strNumeric = '123';
	var strSpace = 'abc def';
	var strNonAlpha = 'ABC:';
	var num = 1200;

	assert.ok(WP.isAlpha(strAlpha), 'Alphabetic string evaluates as true');
	assert.ok(WP.isAlpha(strCapitalAlpha), 'Capitalized alphabetic string evalutes as true');
	assert.notOk(WP.isAlpha(strNonAlpha), 'Partially alphanumeric string evaluates as false');
	assert.notOk(WP.isAlpha(strNumeric), 'Explicitly numeric string evaluates as false');
	assert.notOk(WP.isAlpha(strSpace), 'Strings with space evaluates as false');
	assert.notOk(WP.isAlpha(strNonAlpha), 'Strings with non alphanumeric characters evalues as false');
	assert.notOk(WP.isAlpha(num), 'Numeric variable evaluates as false');
});

QUnit.test('WP.isNumeric', function (assert) {
	var strNumeric = '930329';
	var strAlpha = 'abCDE';
	var strMixed = 'ouex7832';
	var strSpace = '92 2212';
	var strSpaceTrail = '1002 ';
	var strSpaceLead = ' 99981';
	var num = 2203;

	assert.ok(WP.isNumeric(strNumeric), 'Numeric string evaluates as true');
	assert.notOk(WP.isNumeric(strAlpha), 'Alphabetic string evaluates as false');
	assert.notOk(WP.isNumeric(strMixed), 'String with mixed alphanumeric characters evaluates as false');
	assert.notOk(WP.isNumeric(strSpace), 'String with numeric characters and space evaluates to false');
	assert.ok(WP.isNumeric(strSpaceTrail), 'String with trailing space evaluates as true');
	assert.ok(WP.isNumeric(strSpaceLead), 'String with leading space evaluates as true');
	assert.ok(WP.isNumeric(num), 'Numeric variable evaluates as true');
});

QUnit.test('WP.isArray', function (assert) {
	var array = [];
	var arrayFilled = [1, 2];
	var object = {};
	var objectFilled = { 0 : 'a' };
	var objectFilled2 = { a : 'b' };
	var string = 'This is a string';
	var num = 200;

	assert.ok(WP.isArray(array), 'Returns true if value passed into function is an array');
	assert.ok(WP.isArray(arrayFilled), 'Returns true if value passed into function is an array with values');
	assert.notOk(WP.isArray(object), 'Returns false if value is an object');
	assert.notOk(WP.isArray(objectFilled), 'Returns false even if object has numeric keys');
	assert.notOk(WP.isArray(objectFilled2), 'Returns false if object has non-numeric keys');
	assert.notOk(WP.isArray(string), 'Returns false if input is a string');
	assert.notOk(WP.isArray(num), 'Returns false if input is a number');
});

QUnit.test('WP.zeroPad', function (assert) {
	assert.equal(WP.zeroPad(2, 5), '00002', 'Pads number 2 with 4 proceeding zeros when places is 5');
	assert.equal(WP.zeroPad('25', 4), '0025', 'Pads string "22" with 2 proceeding zeros when places is 4');
	assert.equal(WP.zeroPad(99999, 3), '99999', 'Does not pad string in case that max length is less than current length');
});

QUnit.test('WP.normal', function (assert) {
	var inputKeycodeSpaces = 'eK60 3422 1022+10';
	var inputKeycodeCompact = 'eK5033220656+00';
	var inputKeycodeSplit = 'eK204444 1022+06';

	var outputSpaces = WP.normal(inputKeycodeSpaces);
	var outputCompact = WP.normal(inputKeycodeCompact);
	var outputSplit = WP.normal(inputKeycodeSplit);

	assert.equal(outputSpaces, 'eK6034221022+10', 'Formats input with spaces');
	assert.equal(outputCompact, inputKeycodeCompact, 'Formats input without spaces');
	assert.equal(outputSplit, 'eK2044441022+06', 'Formats input with single space');
});

QUnit.test('WP.normalArray', function (assert) {
	var inputKeycode1 = 'eK6620201000+05';
	var inputKeycode2 = 'fN203434 2001+19';

	var output1 = WP.normalArray(inputKeycode1);
	var output2 = WP.normalArray(inputKeycode2);

	assert.ok(typeof output1 === 'object', 'Returns a valid object')
	assert.equal(output1.length, 3, 'Returns array of correct length');
	assert.equal(output1[0], 'eK66', 'Preserved first 4 characters from compact string');
	assert.equal(output2[1], '3434', 'Preserves second 4 characters from compact string');
	assert.equal(output1[2], '1000+05', 'Preserves last 7 characters from compact string');
	assert.equal(output2[2], '2001+19', 'Preserves last 7 characters from compact string, test2');
});

QUnit.test('WP.normalDisplay', function (assert) {
	var inputKeycodeCompact = 'eK6920019291+02';
	var inputKeycodeUnformatted = 'eK40 4422 6699+07';
	var inputKeycodeSplit = 'fN225001 1999+00';

	var outputCompact = WP.normalDisplay(inputKeycodeCompact);
	var outputUnformatted = WP.normalDisplay(inputKeycodeUnformatted);
	var outputSplit = WP.normalDisplay(inputKeycodeSplit);

	assert.equal(outputCompact, 'eK69 2001 9291+02', 'Compact keycode reformatted properly for display');
	assert.equal(outputUnformatted, 'eK40 4422 6699+07', 'Unformatted keycode reformatted properly for display');
	assert.equal(outputSplit, 'fN22 5001 1999+00', 'Split keycode reformatted properly for display');
});

QUnit.test('WP.isFeet', function (assert) {
	var footage = "100+00'";
	var keycode = 'eK90 2000 1000+01';
	var singleQuote = "200'+00";

	assert.ok(WP.isFeet(footage), 'Returns true if single quote is last character in string');
	assert.notOk(WP.isFeet(keycode), 'Returns false if string does not end in single quote character');
	assert.notOk(WP.isFeet(singleQuote), 'Returns false if string contains single quote but is not last character');
});

QUnit.test('WP.fromFeet', function (assert) {
	var footage1 = "100+00'";
	var footage2 = "55+22'";

	assert.equal(WP.fromFeet(footage1), 4000, 'Returns 4000 frames for 100 feet plus 0 frames');
	assert.equal(WP.fromFeet(footage2), (55 * 40) + 22, 'Converts footage notation to frames count as simple arithmatic would');
	assert.notEqual(WP.fromFeet(footage2), 55 * 40, 'Does not convert footage notation to rounded values of feet');
});

QUnit.test('WP.toFeet', function (assert) {
	var frames1 = 4000;
	var frames2 = (55 * 40) + 22;
	var start3 = "0+00'";
	var start4 = "1+25'";
	var frames3 = 22 * 40;
	var frames4 = 22 * 40;

	assert.equal(WP.toFeet(frames1), "100+00'", 'Returns string representing 100 feet when provided with 4000 frame count');
	assert.equal(WP.toFeet(frames2), "55+22'", 'Returns string representing 55 feet and 22 odd frames. Inverse of previously used example')
	assert.equal(WP.toFeet(frames3, start3), "22+00'", 'Returns string representing 22 feet and 0 odd frames when starting value is equivalent of 0 feet and 0 frames');
	assert.equal(WP.toFeet(frames4, start4), "23+25'", 'Returns string representing 22 feet + 1 feet and 0 frames + 25 frames when starting values is equivalent of 1 feet and 25 frames');
});

QUnit.test('WP.isKey', function (assert) {
	var key = '3404+00';
	var feet = "55+00'";
	var longKey = 'eK99 2440 9000+00';
	var compactKey = 'fN2039398888+08';
	var missplaced = '200+001';

	assert.ok(WP.isKey(key), '7 character key is validated.');
	assert.notOk(WP.isKey(feet), 'Footage string is deemed invalidated.');
	assert.ok(WP.isKey(longKey), 'Long display keys are validated.');
	assert.ok(WP.isKey(compactKey), 'Compact stored keys are validated.');
	assert.notOk(WP.isKey(missplaced), 'Keys with missplaced plus signs are invalidated');
});

//QUnit.test('WP.fromKey', function (assert) {})
//QUnit.test('WP.toKey', function (assert) {})

//prioritized

//WP.isKey
//WP.fromKey
//WP.toKey

//WP.toTimecode
//WP.toRough
//WP.pulldown

//WP.correct

/*
WP:

build
dataInput
saveKeycode
detectBlack
correctBlack
storeReel
clearReel
getReels
saveReelsToFile
updateCuts
editLearn
genStats
displayCutlist
compare
reIndex
sortTracks
sortCuts
sortReels
xml2json
removeLines
api
*/

/*
classes

Film
Reel
Cut
*/