// create ace editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/javascript");

// create hyperace and listener
var hyper = hyperace.create(editor, 'results', 'exp');
// for jQuery if you must
// $('#search').click(function () {
document.getElementById('search').addEventListener('click', function () {
    hyper.search();
});

document.getElementById('exp').addEventListener('keyup', function (e) {
    if (e.keyCode == 13)
        hyper.search();
});

document.getElementById("regex").addEventListener('click', function () {
    hyper.set({"regExp": this.checked});
});

document.getElementById("case").addEventListener('click', function () {
    hyper.set({"caseSensitive": this.checked});
});

document.getElementById("whole").addEventListener('click', function () {
    hyper.set({"wholeWord": this.checked});
});

document.getElementById("acemode").addEventListener('change', function () {
    editor.getSession().setMode({"path": "ace/mode/" + this.value});
});

// -----------------------------------------------------------------------

// create ace editor2
var editor2 = ace.edit("editor2");
editor2.setTheme("ace/theme/eclipse");
editor2.getSession().setMode("ace/mode/javascript");
var hyper2 = hyperace.create(editor2, 'results2');

document.getElementById("acemode2").addEventListener('change', function () {
    editor2.getSession().setMode({"path": "ace/mode/" + this.value});
});


// -----------------------------------------------------------------------------------------------------------------


// create ace editor
var editor3 = ace.edit("editor3");
editor3.setTheme("ace/theme/eclipse");
editor3.getSession().setMode("ace/mode/javascript");
editor3.on("changeSession", function(e) {
    setTab(hyper3.currentSession);
});
var sessions = [];
var hyper3 = hyperace.create(editor3, 'results3', null, {'load': function () {
    hyper3.searchMultiSession = true;

    $('#editor3 .ace_search').append($('#appendopt').html());
    document.body.removeChild($('#appendopt')[0]);
    $('[name=hyperwho]').change(function () {
        hyper3.searchMultiSession = this.id == 'hyperall' ;
    });
    editor3.focus();

    var sessioncount = 0; // track for all 3 sessions loaded
    // load content from project files
    $.get('instances.js', function(data) {
            sessions['instances.js'] = editor3.getSession();
            editor3.getSession().setValue(data);
            sessioncount++;
            if (sessioncount == 3) hyper3.setSessions(sessions);

        },
        "text" // recursive if not set
    );
    $.get('instances.html', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/xml"
        });
        sessions['instances.html'] = session;
        sessioncount++;
        if (sessioncount == 3) hyper3.setSessions(sessions);
    });
    $.get('style.css', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/css"
        });
        sessions['style.css'] = session;
        sessioncount++;
        if (sessioncount == 3) hyper3.setSessions(sessions);
    });
}});

// tab control
$('.tabs li a').click(function() {
    hyper3.setSession($(this).attr('id'));
    setTab($(this).attr('id'));

});

function setTab(id) {
    $('.tabs li a').each(function () {
        if(id==$(this).attr('id'))
            $(this).parent().addClass('on');
        else
            $(this).parent().removeClass('on');
    });
}
