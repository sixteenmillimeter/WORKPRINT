	 _       ______  ____  __ __ ____  ____  _____   ________
	| |     / / __ \/ __ \/ //_// __ \/ __ \/  _/ | / /_  __/
	| | /| / / / / / /_/ / ,<  / /_/ / /_/ // //  |/ / / /   
	| |/ |/ / /_/ / _, _/ /| |/ ____/ _, _// // /|  / / /    
	|__/|__/\____/_/ |_/_/ |_/_/   /_/ |_/___/_/ |_/ /_/ v10    
	LE16 - Linear Editor for 16mm                                                       

WORKPRINT (formerly freekode) is a cutlist generator that allows
filmmakers to cut their 16mm film in Final Cut Pro or Adobe Premiere and export a
valid cutlist without the use of Flex files or keykode burn-in.

### I. Shoot film. 16mm.

### II. Get it processed.

At this point you can do whatever you want with the footage. Send it to a lab, process it by hand (carefully), whatever. The minimum requirement is that you have a processed negative with legible keykode markings on the edge. Many labs offer prints and transfers of negative moviefilm and you are able to make use of both with WORKPRINT.

### III. Log your footage.

First, a little about keykcode. Keykode on Kodak films (called MR-code on Fuji stock) consists of 12 characters in 3 groups of 4 that run along the edge of the film. Something like: `eK65 2322 1201` These can be used to identify specific single frames by assigning them a unique value. Read more on [Wikipedia](http://en.wikipedia.org/wiki/Keykode).

The markings appear every 20 frames. The notation for identifying single frames looks something like this: `eK65 2322 1201 +12`. The "+" number after the keykode (always a positive) represents the number of frames past the 20th frame marked with a dot. The numbers range from 00 to 19. Therefore the value `eK65 2322 1206 +12` would be located exactly 100 frames after the keycode the first example in this paragraph because the last group of 4 digits are 5 greater than the first.

If you can identify a frame by its keykode, you can log your footage. Select and physically mark the earliest and latest frames you can identify on your reels. Use a marker, a holepunch or really anything that will leave a visible mark on the print or negative. These marks are essential to the accuracy of the cutlist. Record the 'in' and 'out' keykode values so they can be associated with each reel.

### IV. Digitize the footage. 

Transfer your film any way you like. If you want, you can project the negative on a screen or wall and record it with DSLR or any kind of camera. Keep in mind that cellphone cameras can compress videos by using a variable frame rate ([VFR](https://en.wikipedia.org/wiki/Variable_frame_rate)) which can cause the output of this software to be unreliable. Using a crystal-sync projector is recommended.

### V. Import your footage.

Log and capture your footage in your NLE from the first marked frame to the last marked frame on every reel. Any handles before or after the marked in and out frames will cause your cutlist to be inaccurate.

In the case that you aren't importing from a source where your footage doesn't exactly start or stop with the marked frames you have two options:

* Create and export sub-clips of the videos at exactly the start and end frames of each reel.
* Create individual sequences for each reel which include sub-clibs of the videos starting and ending at the marked frames. Edit using nested sequences.

### VI. Edit.

Edit your film as you would any other video. Make sure it's a single sequence without any nested sequences in it. You can even cut to your sound.

### VII. Export.
	
For Final Cut Pro 7, export an Apple XML Interchange Format version 4 or 5 of your sequence. File > Export > XML. 

For Adobe Premiere, export using File > Export > Final Cut Pro XML.

### VII. WORKPRINT.

Go to [sixteenmillimeter.com/projects/workprint](http://sixteenmillimeter.com/projects/workprint) and upload your XML file. You will be prompted to enter the logged keykode information about each unique reel the software detects. Once you have entered the values, they are stored to your browser if you ever try to upload a new version of the cut using the same reels.

Your cutlist is generated, along with a chart of reels used and a measurement of how much clear leader is needed for black space. 
