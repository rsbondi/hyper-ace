// create ace editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.getSession().setMode("ace/mode/javascript");
editor.on("changeSession", function(e) {
    setTab(hyper.currentSession);
});
var sessions = [];
var hyper = hyperace.create(editor, 'results', null, {'load': function () {
    hyper.searchMultiSession = true;
    $('.ace_search').append($('#appendopt').html());
    document.getElementById('appendopt').parentNode.removeChild(document.getElementById('appendopt'));
    $('[name=hyperwho]').change(function () {
        hyper.searchMultiSession = this.id == 'hyperall' ;
    });
    editor.focus();

    var sessioncount = 0; // track for all 3 sessions loaded
    // load content from project files
    $.get('sessions.js', function(data) {
            sessions['sessions.js'] = editor.getSession();
            editor.getSession().setValue(data);
            sessioncount++;
            if (sessioncount == 3) hyper.setSessions(sessions);

        },
        "text" // recursive if not set
    );
    $.get('sessions.html', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/xml"
        });
        sessions['sessions.html'] = session;
        sessioncount++;
        if (sessioncount == 3) hyper.setSessions(sessions);
    });
    $.get('style.css', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/css"
        });
        sessions['style.css'] = session;
        sessioncount++;
        if (sessioncount == 3) hyper.setSessions(sessions);
    });

}});


// tab control
$('.tabs li a').click(function() {
    hyper.setSession($(this).attr('id'));
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

