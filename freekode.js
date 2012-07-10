/*
var inn = 'em7602187604+16';
var inn = '02187604+16';
var inn = '0011+02';
var test = keykodeInt(inn);
console.log(test);
var test2 = keykodeOut(test);
var Rolls = {};
Rolls = roll(0,0,0,0,0);
console.dir(Rolls);
console.log(normal('em76 0218 7604+16'));
*/
$(document).ready(function(){
    var Rolls = {};
    Rolls[0] = reel('EK76 0383 6299+02','EK76 0383 6495+18',3933,24,'CIN1');
    Rolls[1] = reel('EC68 1237 6734+00','EC68 1237 6933+00',3976,24,'ONE');
    Rolls[2] = reel('EC63 1565 8033+14','EC63 1565 8242+01',4162,24,'SOFS');
    Rolls[3] = reel('EC76 1539 8252+04','EC76 1539 8329+04',1445,24,'OA');
    Rolls[4] = reel('EC76 1026 6730+02','EC76 1026 6933+05',5070,29.97,'MKD');
    Rolls[5] = reel('EM76 2056 8261+17','EM76 2056 8464+07',5060,29.97,'S8BU');
    //console.dir(Rolls);
    //console.log(Rolls[0].keyIn(3933,true));
   //buildFilm('fkfiles/Parings5.xml');
});

var reels = [],
    cuts = [],
    uniqueReels = [],
    subCuts = '',
    once = 0;
var buildFilm = function(filepath){
$.ajax({
        type: "GET",
        url: filepath,
        dataType: "xml",
        success: function(xml){
            var xmlObj = $.xml2json(xml);
            var sequence = xmlObj.sequence.media.video,
            //get role data from sequence header
                title = xmlObj.name,
                rate = xmlObj.timebase,
                seqLength = xmlObj.duration,
                clips = sequence.track.clipitem,
                incReels = 0;
                for(var i = 0;i<clips.length;i++){
                    var name = clips[i].name.replace(/\s+/g,''),
                        dur = clips[i].duration,
                        id = name+''+dur,
                        inn = clips[i]['in'],
                        out = clips[i].out,
                        start = clips[i].start,
                        end = clips[i].end;
                        if($.inArray(name+''+dur,uniqueReels)==-1){
                            uniqueReels[incReels] = id;
                            //reels[incReels] = reel(keyIn,keyOut,dur,rate,name);
                            reels[incReels] = id;
                            incReels++;
                        }
                        cuts[i] = {};
                        cuts[i].name = name;
                        cuts[i].id = id;
                        cuts[i].rollLen = dur;
                        cuts[i].I = Math.round(inn);
                        cuts[i].O = Math.round(out);
                        cuts[i].start = Math.round(start);
                        cuts[i].end = Math.round(end);
                        cuts[i].len = Math.round(end-start);
                        cuts[i].rate = rate;
                }
                console.dir(cuts);
        }
    });
}


//i=inkeykode o=outkeycode d=digital length b=timebase(24/29) n=name
var reel = function(i,o,d,b,n){
    var newReel = {};
    if(n==null||n==undefined){
        var f = explode('+',i);
        n = f[0].substring(0,8);
    }
    // generate 
    newReel.name = n;
    newReel.base = b; //timebase
    i = normal(i); //normalized in keycode
    o = normal(o); //normalized out keycode
    newReel.strI = i;
    newReel.intI = keykodeInt(i); //film frames integer
    newReel.strO = o;

    var overCheck = keykodeInt(o);
    if(overCheck<newReel.intI){ //film frames if keycode rolls over at 1000, like 9999 - 0001
        newReel.intO = 200000 + overCheck;
    }else{
        newReel.intO = overCheck;
    }

    newReel.key = new Array();
    newReel.key[0] = i.substring(0,4);//AA00
    newReel.key[1] = i.substring(4,8);//0000
    newReel.key[2] = i.substring(8,12);//0000
    newReel.key[3] = i.substring(13,15);//00

    newReel.lenFr = newReel['intO']- newReel['intI']; // film frame length
    newReel.lenFt = feet(newReel['lenFr']); // film feet length
    newReel.lenD = d; //digital length
    newReel.lenD24 = null; //digital length at 24 frames, converted by case below
    if(b!=24){
        newReel.lenD24 = (d/b)*24;
    }else{
  newReel.lenD24 = d;   
    }
    newReel.drift = newReel['lenFr'] - newReel['lenD24'];//difference between film and ddigital
    newReel.C = newReel['drift']/newReel['lenFr'];//correction constant

    //feet in(on film) from digital integer value
    newReel.feetIn = function(value){
        if(newReel['base']!=24){
           value = Math.round((value/newReel['base'])*24);
        }
        value = value + Math.ceil((value * newReel['C']));
        outVal = Math.floor(feet(value));
        return outVal;
    };
	//key frame in from digital integer value
	//rest = rest of the keycode, type = film/digital
    newReel.keyIn = function(value,rest,type){
	if(type==undefined||type==null){
		var type = false; 
	}
        if(rest==null||rest==undefined){
            rest = false;
        }
	var key = 0;
	var base = newReel['intI'];
	if(type){//film
		key = base + value;
	}else{ 
		key = base + value + Math.ceil(value* newReel['C']) ;
	}
       
        key = keykodeOut(key);
        if(rest==true){
            var dif=newReel['key'][1];
            if(newReel['intO']>200000){
                dif++;
            }
            var keyRest = newReel['key'][0] + '' +dif;
            key = keyRest + key;
        }
        return key;
    }

	//number of frames in from keycode, true = film, false = video
    newReel.framesIn = function(key, type){
	if(type==undefined||type==null){
		var type = true; 
	}
	key = normalize(key);
	var i = keycodeInt(key) - newReel['intI'];
	if(!type){
		i = Math.ceil(i / newReel['C']);
	}
	return i;
     }
	//number of feet in from keycode
    newReel.feetIn = function(key, type){
	var val = newReel.framesIn(key,type),
	    feetStr = feet(val);
    	return feetStr;
	}
	
    return newReel;
}
// new roll object
/*
{
    "_type" : "roll",
    "name" : "",
    "in" : [ 
        "EM70",
        "0218",
        "7804+16"
        ],
    "out" : [
        "EM70",
        "0218",
        "7806+00"
        ],
    "footage" : "0000+00'",
    "filename" : "",
    "digital" : 5000,
    "framerate" : 29.97
}
*/

var keykodeInt = function(eval){
    var a = eval.length;
    if(a==16||a==17){
        val = normal(eval);
    }
    var fr = eval.split('+');
    if(a==15&&fr[1]!=null){
            var end = fr[0].substr(8,12);
            return parseInt(end,10)*20+parseInt(fr[1],10);
    }else if(a==11&&fr[1]!=null){
            var end = fr[0].substr(4,8);
            return parseInt(end,10)*20+parseInt(fr[1],10);      
    }else if(a==7&&fr[1]!=null){
            return parseInt(fr[0],10)*20+parseInt(fr[1],10);        
    }else{
      alert('Incorrect format');
    }
}

var keykodeOut = function(eva){
    var b = eva.length;
    var fra = eva%20;
    var pre =  Math.floor(eva/20);
    pre = z4(pre);
    var kk = pre+'+'+z0(fra);
    return kk;
}

//normalize keycode values
//'XXXX00000000+00'
var normal = function(j){
    if(j.length==17){
        return j.substring(0,4)+j.substring(5,9)+j.substring(10,17);
    }else if(j.length==16){
        var e = explode(' ',j);
        return e[0]+''+e[1];
    }else if(j.length==15){
        return j;
    }
}

var normalArray = function (key) {
    key = normal(key);
    var returnArray = [];
    returnArray[0] = key.substring(0,4);
    returnArray[1] = key.substring(4,8);
    returnArray[2] = key.substring(8,14);
    return returnArray;
}

var display = function () {

}

var feet = function(val){
    var check = explode('+',val);
    if(check[1]!=null){
        val = keykodeInt(val);
    }
        var base = Math.floor(val/40);
        var fra = val%40;
        return z4(base)+'+'+z0(fra)+"'";
}

var keyCodeID = function(){
    var arr = new Array();

}

var z0 = function(a){
    if(parseInt(a,10)<10){
        a = "0" + a;
    } 
    return a; 
} 

var z4 = function(d){
    var dig = Math.floor(log10(d))+1;
    if(dig<4){
        d += '';
        for(var i=0;i<(4-(dig));i++){ 
            d = '0'+''+d;
        } 
    } 
    return d; 
}

//Adds leading zeros of any length
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

var toFeet = function (frames) { 
    var feet = Math.floor(frames / 40),
        frames = frames % 40;
    return feet +'+'+zeroPad(frames,2)+"'";
}

//All feet measurements must be marked with trailing '
//can be unpadded with preceding 0
var fromFeet = function (footage) {
    var pieces = footage.split('+'),
        feet = parseInt(pieces[0]),
        frames = parseInt(pieces[1].substring(0,2));
    return (feet * 40) + frames;
}

var toKey = function (frames) {
    var first = Math.floor(frames / 20),
        second = frames % 20;
    return zeroPad(first,4)+'+'+zeroPad(second);
}
//Always represented in padded values
//0000+00
var fromKey = function (key) {
    var first = parseInt(key.substring(0,4)),
        second = parseInt(key.substring(5,7));
    return (first * 20) + second;
}

//PACKEDEXTRAS 

function log10 (arg) {
    return Math.log(arg) / 2.302585092994046; // Math.LN10
}
function explode (delimiter, string, limit) {
    var emptyArray = {
        0: ''
    };
    // third argument is not required
    if (arguments.length < 2 || typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined') {
        return null;
    }
    if (delimiter === '' || delimiter === false || delimiter === null) {
        return false;
    }
    if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    if (!limit) {
        return string.toString().split(delimiter.toString());
    }
    // support for limit argument
    var splitted = string.toString().split(delimiter.toString());
    var partA = splitted.splice(0, limit - 1);
    var partB = splitted.join(delimiter.toString());
    partA.push(partB);
    return partA;
}
//xml2json
;if(window.jQuery)(function($){$.extend({xml2json:function(xml,extended){if(!xml)return{};function parseXML(node,simple){if(!node)return null;var txt='',obj=null,att=null;var nt=node.nodeType,nn=jsVar(node.localName||node.nodeName);var nv=node.text||node.nodeValue||'';if(node.childNodes){if(node.childNodes.length>0){$.each(node.childNodes,function(n,cn){var cnt=cn.nodeType,cnn=jsVar(cn.localName||cn.nodeName);var cnv=cn.text||cn.nodeValue||'';if(cnt==8){return}else if(cnt==3||cnt==4||!cnn){if(cnv.match(/^\s+$/)){return};txt+=cnv.replace(/^\s+/,'').replace(/\s+$/,'')}else{obj=obj||{};if(obj[cnn]){if(!obj[cnn].length)obj[cnn]=myArr(obj[cnn]);obj[cnn]=myArr(obj[cnn]);obj[cnn][obj[cnn].length]=parseXML(cn,true);obj[cnn].length=obj[cnn].length}else{obj[cnn]=parseXML(cn)}}})}};if(node.attributes){if(node.attributes.length>0){att={};obj=obj||{};$.each(node.attributes,function(a,at){var atn=jsVar(at.name),atv=at.value;att[atn]=atv;if(obj[atn]){obj[cnn]=myArr(obj[cnn]);obj[atn][obj[atn].length]=atv;obj[atn].length=obj[atn].length}else{obj[atn]=atv}})}};if(obj){obj=$.extend((txt!=''?new String(txt):{}),obj||{});txt=(obj.text)?(typeof(obj.text)=='object'?obj.text:[obj.text||'']).concat([txt]):txt;if(txt)obj.text=txt;txt=''};var out=obj||txt;if(extended){if(txt)out={};txt=out.text||txt||'';if(txt)out.text=txt;if(!simple)out=myArr(out)};return out};var jsVar=function(s){return String(s||'').replace(/-/g,"_")};function isNum(s){var regexp=/^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/return(typeof s=="number")||regexp.test(String((s&&typeof s=="string")?jQuery.trim(s):''))};var myArr=function(o){if(!$.isArray(o))o=[o];o.length=o.length;return o};if(typeof xml=='string')xml=$.text2xml(xml);if(!xml.nodeType)return;if(xml.nodeType==3||xml.nodeType==4)return xml.nodeValue;var root=(xml.nodeType==9)?xml.documentElement:xml;var out=parseXML(root,true);xml=null;root=null;return out},text2xml:function(str){var out;try{var xml=($.browser.msie)?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();xml.async=false}catch(e){throw new Error("XML Parser could not be instantiated")};try{if($.browser.msie)out=(xml.loadXML(str))?xml:false;else out=xml.parseFromString(str,"text/xml")}catch(e){throw new Error("Error parsing XML string")};return out}})})(jQuery);


