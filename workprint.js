/*
	 _       ______  ____  __ __ ____  ____  _____   ________
	| |     / / __ \/ __ \/ //_// __ \/ __ \/  _/ | / /_  __/
	| | /| / / / / / /_/ / ,<  / /_/ / /_/ // //  |/ / / /   
	| |/ |/ / /_/ / _, _/ /| |/ ____/ _, _// // /|  / / /    
	|__/|__/\____/_/ |_/_/ |_/_/   /_/ |_/___/_/ |_/ /_/ v.10    
	LE16 - Linear Editor for 16mm                                                       
*/

$('#upload').bind('click', function () {
    'use strict';
    $('#landing').fadeOut('560');
    $('#uploadFile').delay('560').fadeIn('560');
});

$('input#browseFile').change(function (evt) {
    'use strict';
    var file = evt.target.files[0];
    if (file.type === 'text/xml') {
        $('#loadFile').removeClass('disabled');
    } else {
        if (!$('#loadFile').hasClass('disabled')) {
            $('#loadFile').addClass('disabled');
        }
    }
});

$('#uploadFile').ajaxForm({
    beforeSubmit: function (a, f, o) {
        'use strict';
        o.dataType = 'json';
    },
    success: function (data) {
        'use strict';
        WP.build(data);
    }
});

var film = {},
	//Workprint basic funtionality.
WP = {
		build : function (obj) {
			'use strict';
			if (obj!= false && obj !== undefined) {
				if (obj['@attributes'].version === "5" || obj['@attributes'].version === "4") {
					console.log('XML2JSON:')
					console.dir(obj);
					var cuts = [],
						reels = [],
						keys = [];
					if (this.isArray(obj.sequence.media.video.track)){
						for (var i in obj.sequence.media.video.track) {
							if (obj.sequence.media.video.track[i].clipitem !== undefined) {
								cuts = cuts.concat(obj.sequence.media.video.track[i].clipitem);
							}
						}
						cuts.sort(this.sortTracks);
					} else {
						cuts = obj.sequence.media.video.track.clipitem;
					}
					//populate film data
					film.deanLearner = new brain.NeuralNetwork();
					film.type = "film";
					film.name = obj.sequence.name;
					film.id = uuid();
					film.reels = [];
					film.cuts = [];
					//console.dir(film);
					for (var i in cuts) {
						//Isolate reels, put into objects/arrays
						if ( $.inArray(cuts[i].name + '**' + cuts[i].duration, reels) === -1) {
							var unique = reels.length;
							reels[unique] = cuts[i].name + '**' + cuts[i].duration;
							film.reels[unique] = {};
							film.reels[unique].type = 'reel';
							film.reels[unique].id = uuid();
							keys[reels[unique]] = film.reels[unique].id;
							film.reels[unique].name = cuts[i].name;
							film.reels[unique].keycode = {'i':null,'o':null};
							film.reels[unique].frames = null;
							film.reels[unique].footage = null;
							film.reels[unique].rough = this.toRough((parseInt(cuts[i].duration) - 1), parseFloat(cuts[i].rate.timebase));
							film.reels[unique].realtime = null;
							film.reels[unique].digital = parseInt(cuts[i].duration) - 1; //SUBTRACTING 1 FROM FCP REPORTED LENGTH, so 0 = 0 not 0 = 1
							film.reels[unique].timecode = this.toTimecode(parseInt(film.reels[unique].digital), parseFloat(cuts[i].rate.timebase));
							film.reels[unique].deviate = 0;
							film.reels[unique].C = 0;
							film.reels[unique].filename = null;
							film.reels[unique].framerate = parseFloat(cuts[i].rate.timebase);
							if (film.reels[unique].framerate === 30) {
								film.reels[unique].framerate = 29.97;
							}
						}
						//Isolate cuts, put into objects/arrays
						film.cuts[i] = {};
						film.cuts[i].type = 'cut';
						film.cuts[i].index = parseInt(i);
						film.cuts[i].id = uuid();

						film.cuts[i].reel = cuts[i].name;
						film.cuts[i].digital = {
							'i' : parseInt(cuts[i].in),
							'o' : parseInt(cuts[i].out - 1)
						};
						film.cuts[i].feet = {'i' : null, 'o' : null};
						film.cuts[i].keycode = {'i':null,'o':null};
						//film.cuts[i].realtime = {'i' : null, 'o' : null};
						film.cuts[i].timecode = {
							'i' : this.toTimecode(cuts[i].in, cuts[i].rate.timebase),
							'o' : this.toTimecode(cuts[i].out, cuts[i].rate.timebase)
						};
						film.cuts[i].deviate = 0;
						film.cuts[i].location = {
							'start' : parseInt(cuts[i].start),
							'end' : parseInt(cuts[i].end)
						};
					}
					this.detectBlack();
					this.dataInput();
				}
			return false;
		}
	},
	//update sidebar ui
	//@returns: layout of forms to accept keycode data
	dataInput : function () {
		'use strict';
		//console.dir(film);
		$('#uploadFile').fadeOut('560');
		$('#keycodeEntry').delay('560').fadeIn('600');
		var storeIndex = $.jStorage.index();
		for (var i in storeIndex) {
			for (var x in film.reels) {
				if (storeIndex[i] == film.reels[x].digital + film.reels[x].name) {
					var r = JSON.parse($.jStorage.get(film.reels[x].digital + film.reels[x].name));
					film.reels[x] = r;
				}
			}
		}

		$('#keycodeEntry').empty();
		$('#keycodeInput').tmpl(film.reels).appendTo('#keycodeEntry');
		for (var i in film.reels) {
			if (film.reels[i].keycode.i !== null && film.reels[i].keycode.o !== null) {
				WP.updateCuts[film.reels[i]];
				WP.saveKeycode($('#inputID-' + film.reels[i].id).find('.keycodeSave').eq(0));
			}
		}
		//events
		$('.keycodeSave').live('click', function () {
	    	WP.saveKeycode($(this));
	  	});
	  	$('.keycodeInput input').live('change', function () {
	  		if ($(this).val().length > 14) {
	  			$(this).addClass('filled');
	  			if ($(this).parent().parent().find('.i').hasClass('filled') && $(this).parent().parent().find('.o').hasClass('filled')) {
					$(this).parent().parent().find('.keycodeSave').removeClass('disabled');
	  			} else {
	  				$(this).parent().parent().find('.keycodeSave').addClass('disabled');
	  			}
	  			
	  		}
	  	});
	  	$('.keycodeInput .btn-warning').live('click', function () {
	  		$(this).parent().find('input.i').val('');
	  		$(this).parent().find('input.o').val('');
	  		var $disp = $(this).parent()
	  		if ($disp.attr('data') !== undefined && $disp.attr('data') !== null && $disp.attr('data') !== '') {
	  			var reel = JSON.parse($.jStorage.get($disp.attr('data')));
				$disp.removeClass('savedKeycode');
				$disp.find('input.i').show();
				$disp.find('input.i').val('');
				$disp.find('.enteredText.i').text('')
				$disp.find('.enteredText.i').hide();
				$disp.find('input.o').show();
				$disp.find('.enteredText.o').text('');
				$disp.find('.enteredText.o').hide()
				$disp.find('.footageEst').text(reel.rough);
				$disp.find('.keycodeSave').removeClass('disabled');
				$.jStorage.deleteKey($disp.attr('data'));
	  		}
	  	});
		return false;
	},
	//@param: $elem - jQuery object, passed as $(this) from click event
	//@returns: this.updateCuts(reel)
	saveKeycode : function ($elem) {
		'use strict';
		var container = $elem.parent(),
			id = container.attr('id');
			var realId = id.split('inputID-');
		for (var i in film.reels) {
			if (film.reels[i].id === realId[1]) {
				var inVal = this.normalDisplay(this.normal(container.find('.i').val())),
					outVal = this.normalDisplay(this.normal(container.find('.o').val()));
				if (inVal !== undefined && inVal !== null) {
					film.reels[i].keycode.i = inVal;
					film.reels[i].keycode.o = outVal;
					var inSplit = inVal.split(' '),
						outSplit = outVal.split(' ');
					film.reels[i].frames = this.fromKey(outSplit[2]) - this.fromKey(inSplit[2]);
					film.reels[i].footage = this.toFeet(film.reels[i].frames);
					film.reels[i].realtime = film.reels[i].frames * (1 / 24);
					film.reels[i] = this.compare(film.reels[i]);
					this.storeReel(film.reels[i]);
				}else{
					$('#inputID-' + film.reels[i].id).attr('data', film.reels[i].digital + film.reels[i].name);
				}
				this.updateCuts(film.reels[i]);
				break;
			}
		}
	},
	//Analyzes existing film.cuts Array for gaps in location values (which determine
	//where on the sequence the cut is placed) 
	//@returns: film.cuts - adds new cuts to Array within film object
	detectBlack : function () {
		'use strict';
		var prev = {},
			black = [];
		for (var i in film.cuts) {
			//console.log('IN: ' + film.cuts[i].location.start);
			//console.log('OUT: ' + film.cuts[i].location.end);
			if (prev.o !== film.cuts[i].location.start && prev.o !== undefined) {
				var obj = {
					deviate : 0,
					digital : {
						i : 0,
						o : 0
					},
					id : uuid(),
					index : 0,
					keycode : {
						i : ['    ','    ','    '],
						o : ['    ','    ','    ']
					},
					location : {
						start : prev.o,
						end : film.cuts[i].location.start
					},
					reel : "*BLACK*",
					feet : {
						i : '',
						o : ''
					},
					timecode : {
						i : '',
						o : ''
					},
					type : "cut"
				};
				black.push(obj);
			}
			prev.i = film.cuts[i].location.start;
			prev.o = film.cuts[i].location.end;
		}
		for (var i in black) {
			film.cuts.push(black[i]);
		}
		film.cuts.sort(this.sortCuts);
	},
	//Corrects cuts of blackness to match the rolls
	//preceding and following the cut
	correctBlack : function () {
		var totalBlack = 0,
			videoBlack = 0,
			rate = 29.97;
		for (var i in film.cuts) {
			if (film.cuts[i].reel === '*BLACK*') {
				if (i === 0) {
					film.cuts[i].C = film.cuts[i+1].C;
					film.cuts[i].framerate = film.cuts[i+1].framerate;
				} else {
					film.cuts[i].C = film.cuts[i-1].C;
					film.cuts[i].framerate = film.cuts[i-1].framerate;
				}
				film.cuts[i].frames = {};
				film.cuts[i].frames.i = 0;
				film.cuts[i].frames.o = this.correct(this.pulldown(film.cuts[i].location.end - film.cuts[i].location.start, film.cuts[i].framerate), film.cuts[i].C)
				film.cuts[i].digital.i = 0;
				film.cuts[i].digital.o = film.cuts[i].location.end - film.cuts[i].location.start;
				film.cuts[i].timecode.i = this.toTimecode(0,film.cuts[i].framerate);
				film.cuts[i].timecode.o = this.toTimecode(film.cuts[i].location.end - film.cuts[i].location.start, film.cuts[i].framerate);
				film.cuts[i].feet.i = this.toFeet(0);
				film.cuts[i].feet.o = this.toFeet(film.cuts[i].frames.o);
				totalBlack += film.cuts[i].frames.o;
				videoBlack += film.cuts[i].digital.o;
				//Whatever the last one is, likely the same as all of them
				rate = film.cuts[i].framerate;
				//console.dir(film.cuts[i]);
			}
		}
		if (totalBlack !== 0) {
			var blackReel = {
				frames : totalBlack,
				footage : this.toFeet(totalBlack),
				digital : videoBlack,
				timecode : this.toTimecode(videoBlack,film.cuts[i].framerate),
				name : '*BLACK*',
				framerate : rate,
				keycode : {
					i : '',
					o : ''
				},
				deviate : totalBlack - this.pulldown(videoBlack, rate),
				C : (totalBlack - this.pulldown(videoBlack, rate)) / totalBlack
			}
			film.reels.push(blackReel);
		}
	},
	//@returns: jStorage key "reels"
	storeReel : function (reel) {
		'use strict';
		//console.dir(reel);
		var index = $.jStorage.index();
		if ($.inArray(reel.digital + reel.name, index) === -1) {
			$.jStorage.set(reel.digital + reel.name, JSON.stringify(reel));
		} else if ($.inArray(reel.digital + reel.name, index) === 0) {

		}
		
		return false;
	},
	//@returns reels.json with all reels data stored in it for upload
	saveReelsToFile : function () {
		$.ajax({
			'url': 'php/reels.php',
			'type': 'POST',
			'data': JSON.stringify(film.reels),
			'success': function (data){
			}
		});
		
	},
	//Traverses film.cuts Array and updates the ones that name match the reel
	//@returns: modified film.cuts Array
	updateCuts : function (reel) {
		'use strict';
		//change display
		var $disp = $('#inputID-' + reel.id);
		$disp.addClass('savedKeycode');
		$disp.find('input.i').hide();
		$disp.find('.enteredText.i').text(reel.keycode.i)
		$disp.find('.enteredText.i').show();
		$disp.find('input.o').hide();
		$disp.find('.enteredText.o').text(reel.keycode.o);
		$disp.find('.enteredText.o').show()
		$disp.find('.footageEst').text(reel.footage);
		$disp.find('.keycodeSave').addClass('disabled');
		//change cuts
		for (var i in film.cuts) {
			if (film.cuts[i].reel === reel.name) {
				if (reel.keycode.i !== null && reel.keycode.i !== undefined) {
					var keyI = reel.keycode.i.split(" "),
					keyBase = keyI[0] + ' ' + keyI[1] + ' ',
					frameBase = this.fromKey(keyI[2]),
					digitalIn = 0, 
					digitalOut = 0;

					digitalIn = this.correct(this.pulldown(film.cuts[i].digital.i, reel.framerate), reel.C);
					//NOTHING TO SEE HERE MOVE ALONG
					//WP.editLearn(film.cuts[i].digital.i, reel.framerate, reel.C, digitalIn);
					//DONE WITH THE DONT WORRY ABOUT IT THING

					digitalOut = this.correct(this.pulldown(film.cuts[i].digital.o, reel.framerate), reel.C);
					//NOTHING TO SEE HERE MOVE ALONG
					//WP.editLearn(film.cuts[i].digital.o, reel.framerate, reel.C, digitalOut);
					//DONE WITH THE DONT WORRY ABOUT IT THING
					film.cuts[i].frames = {
						"i" : digitalIn,
						"o" : digitalOut
					};
					film.cuts[i].keycode.i = keyBase + this.toKey(frameBase + digitalIn);
					film.cuts[i].keycode.o = keyBase + this.toKey(frameBase + digitalOut);
					film.cuts[i].deviate = Math.round(reel.C * (digitalOut - digitalIn));
					film.cuts[i].feet.i = this.toFeet(digitalIn);
					film.cuts[i].feet.o = this.toFeet(digitalOut);
					film.cuts[i].framerate = reel.framerate;
					film.cuts[i].C = reel.C;
				}
				
			}
		}
		var allSaved = true;
		$('.keycodeInput').each(function () {
			if (!$(this).hasClass('savedKeycode')) {
				allSaved = false;
			};
		});
		if (allSaved) {
			this.displayCutlist();
		}
	},
	//teaches NN when film
	editLearn : function (d, f, C, newNew) {
		film.deanLearner.train([{
			input: {
				digital: d,
				framerate: f,
				digitalPulldown: this.pulldown(d, f),
				C: C            
		    },
		    output: {
		        film: newNew
		    }}]);
	},

	// Renders cutlist
	displayCutlist : function () {
		'use strict';
		this.correctBlack();
		$('#keycodeEntry').fadeOut(482);
		$('#cutlist table tbody').empty();
		film.cuts = this.reIndex(film.cuts);
		console.log('FILM OBJECT:');
		console.dir(film);
		for(var i in film.cuts){
			if(film.cuts[i].reel !== '*BLACK*') {
				film.cuts[i].keycode.i = this.normalArray(film.cuts[i].keycode.i);
				film.cuts[i].keycode.o = this.normalArray(film.cuts[i].keycode.o);
			}
		}
		$('#cutDisplay').tmpl(film.cuts).appendTo('#cutlist table tbody');
		$('#cutlist').fadeIn(570);
		$('#reels table tbody').empty();
		$('#reelDisplay').tmpl(film.reels).appendTo('#reels table tbody');
		$('#reels').fadeIn(530);
		return false;
	},
	//normalize keycode values
	//'XXXX00000000+00'
	//@param: j - unformatted String
	//@returns: formated String (XXXX00000000+00)
	normal : function (j) {
		'use strict';
		if (j === null) {return null}
	    if (j.length === 17) {
	        return j.substring(0, 4) + j.substring(5, 9) + j.substring(10, 17);
	    } else if (j.length === 16) {
	        var e = explode(" ", j);
	        return e[0] + '' + e[1];
	    } else if (j.length === 15) {
	        return j;
	    }
	},
	//returns array ["XXXX","0000","0000+00"]
	//@param: key - formatted/unformatted String
	//@returns: Array
	normalArray : function (key) {
		'use strict';
		if (key === null) {return ['','','']}
	    key = this.normal(key);
	    var rtnArr = [];
	    rtnArr[0] = key.substring(0, 4);
	    rtnArr[1] = key.substring(4, 8);
	    rtnArr[2] = key.substring(8, 15);
	    return rtnArr;
	},
	//display keycode as XXXX 0000 0000+00
	//@param: val - formatted/unformatted String (XXXX00000000+00) || Array[3]
	//@returns: formatted String (XXXX 0000 0000+00)
	normalDisplay : function (val) {
		'use strict';
		if (typeof val === 'object') {
			return val[0] + ' ' + val[1] + ' ' + val[2];
		} else if (typeof val === 'string') {
			if (val.length !== 15) {
				val = this.normal(val);
			}
			return val.substring(0, 4) + ' ' + val.substring(4, 8) + ' ' + val.substring(8, 15);
		}
	},
	//@param: reel - object derived from xml
	//@returns: object with corrections applied
	compare : function (reel) {
		'use strict';
		reel.deviate = reel.frames - this.pulldown(reel.digital, reel.framerate);
		reel.C = reel.deviate / reel.frames;
		return reel;
	},
	//@param: frames - integer
	//@param: C - float (correction value)
	//@returns: integer
	correct : function (frames, C) {
		return Math.round(frames + (frames * C));
	},
	//@param: d - integer
	//@param: framerate - float
	//@returns: integer
	pulldown : function (d, framerate) {
		'use strict';
		return Math.floor((d/framerate) * 24);
	},
	//gives a reneral estimate of the length of the roll, probably good within 3-5 frames for 100' rolls
	//@param: frames - integer
	//@param: framerate - float
	//@returns: formatted String (0+00')
	toRough : function (frames, framerate) {
		'use strict';
		var n = Math.floor((frames/framerate) * 24);
		return this.toFeet(n);
	},
	//toTimecode all that is needed for now
	//@param: frames - integer
	//@param: rate - float
	//@returns: formatted String (00:00;00)
	toTimecode : function (frames, rate) {
		'use strict';
		var str = '';
		if (rate === 29.97) {
			rate = 30;
		}
		var first = Math.floor(frames/rate);
		if(first > 60) {
			var second = Math.floor(first/60);
			str += this.zeroPad(second, 2) + ':' + this.zeroPad(first % 60, 2);
		}else{
			str += '00:'+this.zeroPad(first, 2);
		}
		str += ';' + this.zeroPad(frames % rate, 2);
		return str;
	},
	//All feet measurements must be marked with trailing '
	//can be unpadded with preceding 0
	//@param: footage - formated String (0+00')
	//@returns: frames - integer
	fromFeet : function (footage) {
		'use strict';
	    var pieces = footage.split('+'),
	        feet = parseInt(pieces[0], 10),
	        frames = parseInt(pieces[1].substring(0, 2), 10);
	    return Math.round((feet * 40) + frames);
	},
	//Convert frame count to footage notation 0+00'
	//@param: frames - integer
	//@param: start - formated String (optional)
	//@returns: formatted String (0+00')
	toFeet : function (frames, start) {
		'use strict';
		if (start !== null && start !== undefined && start !== "0+00'") {
			frames += this.fromFeet(start);
		}
	    var feet = Math.floor(frames / 40);
	    frames = frames % 40;
	    return feet + '+' + this.zeroPad(frames, 2) + "'";
	},
	//to integer from 7 character format
	//@param: frames - integer
	//@param: start - formated String (0000+00)
	//@returns: formated String (0000+00)
	toKey : function (frames, start) {
		'use strict';
		if (start !== null && start !== undefined && start !== '0000+00') {
			frames += this.fromKey(start);
		}
	    var first = Math.floor(frames / 20),
	        second = frames % 20;
	    return this.zeroPad(first, 4) + '+' + this.zeroPad(second, 2);
	},
	//Always represented in padded values
	//@param: key - formatted String (0000+00)
	//@returns: integer
	fromKey : function (key) {
		'use strict';
	    var first = parseInt(key.substring(0, 4), 10),
	        second = parseInt(key.substring(5, 7), 10);
	    return Math.round((first * 20) + second);
	},
	//
	//@param: arr - Array with object containing index
	//@returns: new Array of objects with corrected index 
	reIndex : function (arr) {
		for (var i in arr) {
			arr[i].index  = i;
		}
		return arr;
	},
	//Lower level functions
	//Adds leading zeros of any length
	//@param: num - integer
	//@param: places - integer
	//@returns: formatted String (0000 for places=4) 
	zeroPad : function (num, places) {
		'use strict';
	    var zero = places - num.toString().length + 1;
	    return Array(+(zero > 0 && zero)).join("0") + num + '';
	},
	//To differentiate feet formatted Strings from keycode strings
	//(hopefully never needed)
	//@param: str - formatted String
	//@returns: boolean
	isFeet : function (str) {
		'use strict';
		if (str.charAt(str.length - 1) === "'") { return true; }
		return false;
	},
	//@param: obj - object or Array
	//@returns: boolean
	isArray : function (obj) {
		'use strict';
	    return obj.constructor == Array;
	},
	//Used to sort cuts from multi-track sequences
	//@param: a - cut object
	//@param: b - cut object
	//@returns: sort value
	sortTracks : function (a, b) {
		'use strict';
		if (parseInt(a.start) < parseInt(b.start)) {
			return -1;
		}
		if (parseInt(a.start) > parseInt(b.start)) {
			return 1;
		}
		return 0;
	},
	sortCuts : function (a, b) {
		'use strict';
		if (a['location']['start'] < b['location']['start']) {
			return -1;
		}
		if (a['location']['start'] > b['location']['start']) {
			return 1;
		}
		return 0;
	}
},

//Calculator for mobile
WPcalc = {
	_ui : function () {
		'use strict';
		$('#WPcalc input').bind('change', function () {
			var id = $(this).attr('id'),
				val = $(this).val(),
				out = '';
			if (id === '') {

			} else if (id === '0') {
				
			}
			$('input#output').val(out);
		});
	},
	firstCase: function () {

	},
	secondCase: function () {
		
	}
}

/*
OBJECT STRUCTURE
var reel = {
	"type" : "reel",
	"id" : uuid,
    "name" : "",
    "keycode" : {
    	"i" : "EM70 0218 7804+16", 
   		"o" : "EM70 0218 7806+00"
   		},
    "frames" : 4000, //real film frames
    "footage" : "0000+00'", 
    "rough" : 0+00', //generate
    "realtime" : 0000000000, //in milliseconds for @24fps
    "digital" : 5000,
    "timecode" : "00:00;00" //@framerate NON-ESSENTIAL
    "deviate" : -2,
    "C" : 0.0000, //float value almost always, correction value for digital cuts
    "filename" : "",
    "framerate" : 29.97
}

//cuts to be stored in an array within a film object
var cut = {
	"type" : "cut",
	"id" : uuid,
	"reelObj" : {}, //Full object or...
	"reel" : 'reference uuid',
	digital : { //video frames
		"i" : 0,
		"o" : 3400
		},
	frames : {
		"i" : 0, 
		"o" 2300
		},
	feet : {
		"i" : "0+00'", 
		"o" : "20+00'"
		},
	keycode : {
		"i" : "XXXX 0000 0000+00", 
		"o" : "XXXX 0000 0000+00"
	},
	realtime : { //very very non-essential, maybe not supported
		"i" : 0000000, //millis
		"o" : 0011011 //@24fps
	},
	timecode : { //represented at framerate grabbed from the object
		"i" : "00:00:00",
		"o" : "00:00:00"
	}
	"deviate" : 0, //frames of deviation d/a occuring within the cut, determined by length
	location : { //location in sequence, digital value, to be converted, valuable for determining black space... hmmm
		"start" : 0,
		"end" : 100
	}
}

var film = {
	"type" : "film",
	"id" : uuid,
	"cuts" : [],
	"reels" : [],
	"name" : "title"
}
*/

/*
Copyright (c) 2012 Matthew McWilliams matt@sixteenmillimeter.com

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

//THE FOLLOWING IS PACKAGED DEPENDENTS, NOT UNDER THE SCOPE OF WORKPRINT.JS:

//php.js explode and log10
function log10 (arg) {return Math.log(arg) / 2.302585092994046;}
function explode(delimiter,string,limit){var emptyArray={"0":""};if(arguments.length<2||typeof arguments[0]=="undefined"||typeof arguments[1]=="undefined")return null;if(delimiter===""||delimiter===false||delimiter===null)return false;if(typeof delimiter=="function"||typeof delimiter=="object"||typeof string=="function"||typeof string=="object")return emptyArray;if(delimiter===true)delimiter="1";if(!limit)return string.toString().split(delimiter.toString());var splitted=string.toString().split(delimiter.toString());
var partA=splitted.splice(0,limit-1);var partB=splitted.join(delimiter.toString());partA.push(partB);return partA};

//uuid generator
var uuid = function () {var S4=function(){return((1+Math.random())*65536|0).toString(16).substring(1)};return S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()};

//jstorage
(function(g){function m(){if(e.jStorage)try{d=n(""+e.jStorage)}catch(a){e.jStorage="{}"}else e.jStorage="{}";j=e.jStorage?(""+e.jStorage).length:0}function h(){try{e.jStorage=o(d),c&&(c.setAttribute("jStorage",e.jStorage),c.save("jStorage")),j=e.jStorage?(""+e.jStorage).length:0}catch(a){}}function i(a){if(!a||"string"!=typeof a&&"number"!=typeof a)throw new TypeError("Key name must be string or numeric");if("__jstorage_meta"==a)throw new TypeError("Reserved key name");return!0}function k(){var a,
b,c,e=Infinity,f=!1;clearTimeout(p);if(d.__jstorage_meta&&"object"==typeof d.__jstorage_meta.TTL){a=+new Date;c=d.__jstorage_meta.TTL;for(b in c)c.hasOwnProperty(b)&&(c[b]<=a?(delete c[b],delete d[b],f=!0):c[b]<e&&(e=c[b]));Infinity!=e&&(p=setTimeout(k,e-a));f&&h()}}if(!g||!g.toJSON&&!Object.toJSON&&!window.JSON)throw Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!");var d={},e={jStorage:"{}"},c=null,j=0,o=g.toJSON||Object.toJSON||window.JSON&&(JSON.encode||JSON.stringify),
n=g.evalJSON||window.JSON&&(JSON.decode||JSON.parse)||function(a){return(""+a).evalJSON()},f=!1,p,l={isXML:function(a){return(a=(a?a.ownerDocument||a:0).documentElement)?"HTML"!==a.nodeName:!1},encode:function(a){if(!this.isXML(a))return!1;try{return(new XMLSerializer).serializeToString(a)}catch(b){try{return a.xml}catch(d){}}return!1},decode:function(a){var b="DOMParser"in window&&(new DOMParser).parseFromString||window.ActiveXObject&&function(a){var b=new ActiveXObject("Microsoft.XMLDOM");b.async=
"false";b.loadXML(a);return b};if(!b)return!1;a=b.call("DOMParser"in window&&new DOMParser||window,a,"text/xml");return this.isXML(a)?a:!1}};g.jStorage={version:"0.1.7.0",set:function(a,b,c){i(a);c=c||{};l.isXML(b)?b={_is_xml:!0,xml:l.encode(b)}:"function"==typeof b?b=null:b&&"object"==typeof b&&(b=n(o(b)));d[a]=b;isNaN(c.TTL)?h():this.setTTL(a,c.TTL);return b},get:function(a,b){i(a);return a in d?d[a]&&"object"==typeof d[a]&&d[a]._is_xml&&d[a]._is_xml?l.decode(d[a].xml):d[a]:"undefined"==typeof b?
null:b},deleteKey:function(a){i(a);return a in d?(delete d[a],d.__jstorage_meta&&("object"==typeof d.__jstorage_meta.TTL&&a in d.__jstorage_meta.TTL)&&delete d.__jstorage_meta.TTL[a],h(),!0):!1},setTTL:function(a,b){var c=+new Date;i(a);b=Number(b)||0;return a in d?(d.__jstorage_meta||(d.__jstorage_meta={}),d.__jstorage_meta.TTL||(d.__jstorage_meta.TTL={}),0<b?d.__jstorage_meta.TTL[a]=c+b:delete d.__jstorage_meta.TTL[a],h(),k(),!0):!1},flush:function(){d={};h();return!0},storageObj:function(){function a(){}
a.prototype=d;return new a},index:function(){var a=[],b;for(b in d)d.hasOwnProperty(b)&&"__jstorage_meta"!=b&&a.push(b);return a},storageSize:function(){return j},currentBackend:function(){return f},storageAvailable:function(){return!!f},reInit:function(){var a;if(c&&c.addBehavior){a=document.createElement("link");c.parentNode.replaceChild(a,c);c=a;c.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(c);c.load("jStorage");a="{}";try{a=c.getAttribute("jStorage")}catch(b){}e.jStorage=
a;f="userDataBehavior"}m()}};(function(){var a=!1;if("localStorage"in window)try{window.localStorage.setItem("_tmptest","tmpval"),a=!0,window.localStorage.removeItem("_tmptest")}catch(b){}if(a)try{window.localStorage&&(e=window.localStorage,f="localStorage")}catch(d){}else if("globalStorage"in window)try{window.globalStorage&&(e=window.globalStorage[window.location.hostname],f="globalStorage")}catch(g){}else if(c=document.createElement("link"),c.addBehavior){c.style.behavior="url(#default#userData)";
document.getElementsByTagName("head")[0].appendChild(c);c.load("jStorage");a="{}";try{a=c.getAttribute("jStorage")}catch(h){}e.jStorage=a;f="userDataBehavior"}else{c=null;return}m();k()})()})(window.$||window.jQuery);

//jquery templates
(function(a){var r=a.fn.domManip,d="_tmplitem",q=/^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,b={},f={},e,p={key:0,data:{}},i=0,c=0,l=[];function g(g,d,h,e){var c={data:e||(e===0||e===false)?e:d?d.data:{},_wrap:d?d._wrap:null,tmpl:null,parent:d||null,nodes:[],calls:u,nest:w,wrap:x,html:v,update:t};g&&a.extend(c,g,{nodes:[],parent:d});if(h){c.tmpl=h;c._ctnt=c._ctnt||c.tmpl(a,c);c.key=++i;(l.length?f:b)[i]=c}return c}a.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(f,d){a.fn[f]=function(n){var g=[],i=a(n),k,h,m,l,j=this.length===1&&this[0].parentNode;e=b||{};if(j&&j.nodeType===11&&j.childNodes.length===1&&i.length===1){i[d](this[0]);g=this}else{for(h=0,m=i.length;h<m;h++){c=h;k=(h>0?this.clone(true):this).get();a(i[h])[d](k);g=g.concat(k)}c=0;g=this.pushStack(g,f,i.selector)}l=e;e=null;a.tmpl.complete(l);return g}});a.fn.extend({tmpl:function(d,c,b){return a.tmpl(this[0],d,c,b)},tmplItem:function(){return a.tmplItem(this[0])},template:function(b){return a.template(b,this[0])},domManip:function(d,m,k){if(d[0]&&a.isArray(d[0])){var g=a.makeArray(arguments),h=d[0],j=h.length,i=0,f;while(i<j&&!(f=a.data(h[i++],"tmplItem")));if(f&&c)g[2]=function(b){a.tmpl.afterManip(this,b,k)};r.apply(this,g)}else r.apply(this,arguments);c=0;!e&&a.tmpl.complete(b);return this}});a.extend({tmpl:function(d,h,e,c){var i,k=!c;if(k){c=p;d=a.template[d]||a.template(null,d);f={}}else if(!d){d=c.tmpl;b[c.key]=c;c.nodes=[];c.wrapped&&n(c,c.wrapped);return a(j(c,null,c.tmpl(a,c)))}if(!d)return[];if(typeof h==="function")h=h.call(c||{});e&&e.wrapped&&n(e,e.wrapped);i=a.isArray(h)?a.map(h,function(a){return a?g(e,c,d,a):null}):[g(e,c,d,h)];return k?a(j(c,null,i)):i},tmplItem:function(b){var c;if(b instanceof a)b=b[0];while(b&&b.nodeType===1&&!(c=a.data(b,"tmplItem"))&&(b=b.parentNode));return c||p},template:function(c,b){if(b){if(typeof b==="string")b=o(b);else if(b instanceof a)b=b[0]||{};if(b.nodeType)b=a.data(b,"tmpl")||a.data(b,"tmpl",o(b.innerHTML));return typeof c==="string"?(a.template[c]=b):b}return c?typeof c!=="string"?a.template(null,c):a.template[c]||a.template(null,q.test(c)?c:a(c)):null},encode:function(a){return(""+a).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")}});a.extend(a.tmpl,{tag:{tmpl:{_default:{$2:"null"},open:"if($notnull_1){__=__.concat($item.nest($1,$2));}"},wrap:{_default:{$2:"null"},open:"$item.calls(__,$1,$2);__=[];",close:"call=$item.calls();__=call._.concat($item.wrap(call,__));"},each:{_default:{$2:"$index, $value"},open:"if($notnull_1){$.each($1a,function($2){with(this){",close:"}});}"},"if":{open:"if(($notnull_1) && $1a){",close:"}"},"else":{_default:{$1:"true"},open:"}else if(($notnull_1) && $1a){"},html:{open:"if($notnull_1){__.push($1a);}"},"=":{_default:{$1:"$data"},open:"if($notnull_1){__.push($.encode($1a));}"},"!":{open:""}},complete:function(){b={}},afterManip:function(f,b,d){var e=b.nodeType===11?a.makeArray(b.childNodes):b.nodeType===1?[b]:[];d.call(f,b);m(e);c++}});function j(e,g,f){var b,c=f?a.map(f,function(a){return typeof a==="string"?e.key?a.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,"$1 "+d+'="'+e.key+'" $2'):a:j(a,e,a._ctnt)}):e;if(g)return c;c=c.join("");c.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,function(f,c,e,d){b=a(e).get();m(b);if(c)b=k(c).concat(b);if(d)b=b.concat(k(d))});return b?b:k(c)}function k(c){var b=document.createElement("div");b.innerHTML=c;return a.makeArray(b.childNodes)}function o(b){return new Function("jQuery","$item","var $=jQuery,call,__=[],$data=$item.data;with($data){__.push('"+a.trim(b).replace(/([\\'])/g,"\\$1").replace(/[\r\t\n]/g," ").replace(/\$\{([^\}]*)\}/g,"{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,function(m,l,k,g,b,c,d){var j=a.tmpl.tag[k],i,e,f;if(!j)throw"Unknown template tag: "+k;i=j._default||[];if(c&&!/\w$/.test(b)){b+=c;c=""}if(b){b=h(b);d=d?","+h(d)+")":c?")":"";e=c?b.indexOf(".")>-1?b+h(c):"("+b+").call($item"+d:b;f=c?e:"(typeof("+b+")==='function'?("+b+").call($item):("+b+"))"}else f=e=i.$1||"null";g=h(g);return"');"+j[l?"close":"open"].split("$notnull_1").join(b?"typeof("+b+")!=='undefined' && ("+b+")!=null":"true").split("$1a").join(f).split("$1").join(e).split("$2").join(g||i.$2||"")+"__.push('"})+"');}return __;")}function n(c,b){c._wrap=j(c,true,a.isArray(b)?b:[q.test(b)?b:a(b).html()]).join("")}function h(a){return a?a.replace(/\\'/g,"'").replace(/\\\\/g,"\\"):null}function s(b){var a=document.createElement("div");a.appendChild(b.cloneNode(true));return a.innerHTML}function m(o){var n="_"+c,k,j,l={},e,p,h;for(e=0,p=o.length;e<p;e++){if((k=o[e]).nodeType!==1)continue;j=k.getElementsByTagName("*");for(h=j.length-1;h>=0;h--)m(j[h]);m(k)}function m(j){var p,h=j,k,e,m;if(m=j.getAttribute(d)){while(h.parentNode&&(h=h.parentNode).nodeType===1&&!(p=h.getAttribute(d)));if(p!==m){h=h.parentNode?h.nodeType===11?0:h.getAttribute(d)||0:0;if(!(e=b[m])){e=f[m];e=g(e,b[h]||f[h]);e.key=++i;b[i]=e}c&&o(m)}j.removeAttribute(d)}else if(c&&(e=a.data(j,"tmplItem"))){o(e.key);b[e.key]=e;h=a.data(j.parentNode,"tmplItem");h=h?h.key:0}if(e){k=e;while(k&&k.key!=h){k.nodes.push(j);k=k.parent}delete e._ctnt;delete e._wrap;a.data(j,"tmplItem",e)}function o(a){a=a+n;e=l[a]=l[a]||g(e,b[e.parent.key+n]||e.parent)}}}function u(a,d,c,b){if(!a)return l.pop();l.push({_:a,tmpl:d,item:this,data:c,options:b})}function w(d,c,b){return a.tmpl(a.template(d),c,b,this)}function x(b,d){var c=b.options||{};c.wrapped=d;return a.tmpl(a.template(b.tmpl),b.data,c,b.item)}function v(d,c){var b=this._wrap;return a.map(a(a.isArray(b)?b.join(""):b).filter(d||"*"),function(a){return c?a.innerText||a.textContent:a.outerHTML||s(a)})}function t(){var b=this.nodes;a.tmpl(null,null,null,this).insertBefore(b[0]);a(b).remove()}})(jQuery);