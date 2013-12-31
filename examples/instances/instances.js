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
var hyper2;


// undocumented ace function, used so we can initialize on callback of searchbox load to pass to hyper-ace
ace.config.loadModule("ace/ext/searchbox", function (e) {
    e.Search(editor2); // set to editor component
    var box = document.getElementById('editor2').getElementsByClassName('ace_search_field')[0]; // get texbox element
    box.id = 'hyperbox'; // hyperace needs id, so we set it for the search box
    box.addEventListener('keyup', function (e) { // look for tab key in search box
        if (e.keyCode == 9)
            hyper2.search();
    });

    hyper2 = hyperace.create(editor2, 'results2', 'hyperbox'); // add hyper-ace editor, target and search box id created above

});


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
var hyper3;
function createhyper(box) {
    hyper3 = hyperace.create(editor3, 'results3', 'hyperbox3'); // add hyper-ace editor, target and search box id created above
    hyper3.setSessions(sessions);
    box.addEventListener('keyup', function (e) { // look for tab key in search box
        if (e.keyCode == 9) {
            if(document.getElementById('hyperall').checked) {
                hyper3.searchSessions();
            } else {
                hyper3.search();
            }
        }
    });
}

// undocumented ace function, used so we can initialize on callback of searchbox load to pass to hyper-ace
ace.config.loadModule("ace/ext/searchbox", function(e) {
    e.Search(editor3); // set to editor component
    var box3 = document.getElementById('editor3').getElementsByClassName('ace_search_field')[0]; // get texbox element
    box3.id = 'hyperbox3'; // hyperace needs id, so we set it for the search box
    box3.value = "result" // example that works in all 3 modes
    $('#editor3 .ace_search').append($('#appendopt').html());
    document.body.removeChild($('#appendopt')[0]);

    var sessioncount = 0; // track for all 3 sessions loaded
    // load content from project files
    $.get('instances.js', function(data) {
            sessions['instances.js'] = editor3.getSession();
            editor3.getSession().setValue(data);
            sessioncount++;
            if (sessioncount == 3) createhyper(box3);

        },
        "text" // recursive if not set
    );
    $.get('instances.html', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/xml"
        });
        sessions['instances.html'] = session;
        sessioncount++;
        if (sessioncount == 3) createhyper(box3);
    });
    $.get('style.css', function(data) {
        var session = new ace.EditSession(data, {
            "path": "ace/mode/css"
        });
        sessions['style.css'] = session;
        sessioncount++;
        if (sessioncount == 3) createhyper(box3);
    });
});

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
