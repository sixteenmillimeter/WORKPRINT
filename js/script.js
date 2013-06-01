$(document).ready(function () {

	$('#upload').bind('click', function () {
		'use strict';
		$('#landing').fadeOut('560');
		$('#uploadFile').delay('560').fadeIn('560');
	});

	$('input#browseFile').bind('change', function (evt) {
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
	
});