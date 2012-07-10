// Add your javascript here
/*
$('#upload').click(function () {
    'use strict';
    $('#landing').fadeOut('560');
    $('#uploadFile').delay('560').fadeIn('560');
});

$('#loadFile').click(function () {
    'use strict';
    if (!$(this).hasClass('disabled')) {
    //buildFilm();
    }
});

var file;
$('input#browseFile').change(function (evt) {
    'use strict';
    file = evt.target.files[0];
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
        build(data);
    }
});
*/