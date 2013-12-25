// create ace editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.getSession().setMode("ace/mode/javascript");
editor.on("changeSession", function(e) {
    setTab(hyper.currentSession);
});
var sessions = [];
var hyper;
function createhyper(box) {
    hyper = hyperace.create(editor, 'results', 'hyperbox'); // add hyper-ace editor, target and search box id created above
    hyper.setSessions(sessions);
    box.addEventListener('keyup', function (e) { // look for tab key in search box
        if (e.keyCode == 9) {
            if(document.getElementById('hyperall').checked) {
                hyper.searchSessions();
            } else {
                hyper.search();
            }
        }
    });
}

// undocumented ace function, used so we can initialize on callback of searchbox load to pass to hyper-ace
ace.config.loadModule("ace/ext/searchbox", function(e) {
    e.Search(editor); // set to editor component
    var box = document.getElementById('editor').getElementsByClassName('ace_search_field')[0]; // get texbox element
    box.id = 'hyperbox'; // hyperace needs id, so we set it for the search box
    box.value = "result" // example that works in all 3 modes

    var sessioncount = 0; // track for all 3 sessions loaded
    $.get('sessions.js', function(data) {
        sessions['sessions.js'] = editor.getSession();
        editor.getSession().setValue(data);
        sessioncount++;
        if (sessioncount == 3) createhyper(box);

    },
    "text" // recursive if not set
    );
    $.get('sessions.html', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/xml"
        });
        sessions['sessions.html'] = session;
        sessioncount++;
        if (sessioncount == 3) createhyper(box);
    });
    $.get('style.css', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/css"
        });
        sessions['style.css'] = session;
        sessioncount++;
        if (sessioncount == 3) createhyper(box);
    });
});

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

