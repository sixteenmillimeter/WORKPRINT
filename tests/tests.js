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
	var inputKeycode2 = 'fN2034342001+19';

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

	console.log(inputKeycodeCompact + ' => ' + outputCompact);
	console.log(inputKeycodeUnformatted + ' => ' + outputUnformatted);
	console.log(inputKeycodeSplit + ' => ' + outputSplit);

	assert.equal(outputCompact, 'eK69 2001 9291+02', 'Compact keycode reformatted properly for display');
	assert.equal(outputUnformatted, 'eK40 4422 6699+07', 'Unformatted keycode reformatted properly for display');
	assert.equal(outputSplit, 'fN22 5001 1999+00', 'Split keycode reformatted properly for display');
});


//tests

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
correct
pulldown
toRough
toTimecode
fromFeet
toFeet
toKey
fromKey
reIndex
zeroPad
isFeet
isKey
isArray
sortTracks
sortCuts
sortReels
isAlpha
isNumeric
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