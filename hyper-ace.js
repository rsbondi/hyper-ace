/**
 * hypersearch for ace editor
 * @class hyperace
 */
var hyperace = function () {}
/**
 * creates a hypersearch instance
 * @param {Editor} editor  the editor
 * @param {string} target  where to display the results
 * @param {string} textbox the search pattern element
 * @param {string} options additional configuration
 * @returns {hypersearch}
 */
hyperace.create = function (editor, target, textbox, options) {
    return new hyperace.hypersearch(editor, target, textbox, options);
};

/**
 * hypersearch constructor
 * @param {Editor} editor  the editor
 * @param {string} target  where to display the results
 * @param {string} textbox the search pattern element
 * @param {string} options additional configuration
 * @class hypersearch
 */
hyperace.hypersearch = function(editor, target, textbox, options) {
    this.activeEditor = 0 ;   // index to editors array
    this.ranges = null ;      // the results of ranges to display
    this.anchors = [] ;  // floating anchors that we jump to when a result is selected
    this.currentSession = 0 ; // the current edit session identifier
    this.editor = editor;
    this.searchMultiSession = false;
    this.target = document.getElementById(target);
    if(textbox) {
        this.textbox = document.getElementById(textbox);
    } else {
        this._acebox();
    }
    this.options = options ? options : [];
    if (options) {
        this.options['matchclass'] = options['matchclass'] ? options['matchclass'] : 'hyperace-match';
        this.options['lineclass'] = options['lineclass'] ? options['lineclass'] : 'hyperace-line';
    } else {
        this.options['matchclass'] = 'hyperace-match';
        this.options['lineclass'] = 'hyperace-line';
    }
    this.sessions = Array(editor.getSession());                  // set for single session, over-ridden for multi
};

hyperace.hypersearch.prototype = {
    /**
     * set sessions for multiple session search
     * @param {Array<EditSession>} sessions array of ace.EditSession objects with the key as named identifier
     */
    setSessions: function (sessions) {
        this.sessions = sessions;
        for (s in this.sessions) {
            this.currentSession = s;
            console.log('initial session set to: ' + s);
            break;
        }
    },

    /**
     * set ace editor search options
     * @param {object} options search options, true or false for any of (regExp, caseSensitive or wholeWord)
     */
    set: function (options) {
        this.editor.$search.set(options);
    },

    /**
     * search across multiple sessions
     */
    searchSessions: function () {
        this.target.innerHTML = '';
        this.ranges = [];
        this.anchors = [];
        var editor = this.editor;
        var hold = editor.getSession();
        for (s in this.sessions) {
            this.anchors[s] = [];
            var session = document.createElement('div');
            session.innerHTML = s;
            session.className = 'hyperace-session';
            this.target.appendChild(session);
            this._search(this.sessions[s], s);
            console.log('session: ' + s + ': ' + this.ranges[s].length + ' matches.');
            if (this.ranges[s].length == 0) {
                this.target.removeChild(session)
            }
        }
        editor.setSession(hold);
    },

    /**
     * search the current session
     */
    search: function () {
        this.target.innerHTML = '';
        this.ranges = [];
        this.anchors = [];
        this.anchors[this.currentSession] = [];
        if (this.currentSession != 0) {                    // if single session, no header
            var header = document.createElement('div');
            header.innerHTML = this.currentSession;
            header.className = 'hyperace-session';
            this.target.appendChild(header);
        }
        this._search(this.editor.getSession(), this.currentSession);
        console.log('searching single session: ' + this.currentSession);
    },

    /**
     * performs the search and sets ranges and anchors
     * @param {EditSession} session the session to search
     * @param {string} s session identifier
     * @private
     */
    _search: function (session, s) {
        console.log('hypersearch activated for expression: ' + this.textbox.value);
        var editor = this.editor;
        if (session) editor.setSession(session);
        var found = editor.findAll(this.textbox.value);
        if(found==0) editor.clearSelection();
        console.log('found '+found+' matches in '+s);
        this.ranges[s] = editor.getSelection().getAllRanges();
        console.log(JSON.stringify(this.ranges[s]));
        editor.exitMultiSelectMode();
        for (r = 0; r < this.ranges[s].length; r++) {
            this.anchors[s].push(editor.getSession().getDocument().createAnchor(this.ranges[s][r].start.row, this.ranges[s][r].start.column));
            this._addResult(r, s);
        }
    },

    /**
     * add a search result to component
     * @param {int} index the index where the range and anchor info is stored
     * @param {string} sessionName the session indentifier for retrieving range and anchor info
     * @private
     */
    _addResult: function (index, sessionName) {
        if (this.ranges[sessionName][index].start.row == this.ranges[sessionName][index].end.row && this.ranges[sessionName][index].start.column == this.ranges[sessionName][index].end.column) {
            this.ranges[sessionName] = [];
            return; // empty result
        }
        var line = this.ranges[sessionName][index].start.row;
        var col = this.ranges[sessionName][index].start.column;
        console.log('found row index ' + index + ' @ line: ' + line);
        var container = document.createElement('div');
        var link = document.createElement('a');
        container.appendChild(link);
        link.href = 'javascript:void(0)';
        link.setAttribute('data-index', index);
        container.setAttribute('data-session', sessionName ? sessionName : 0);
        var rawline = this.editor.getSession().getLine(line);
        var pre = rawline.substr(0, this.ranges[sessionName][index].start.column);
        var match = rawline.substr(this.ranges[sessionName][index].start.column, this.ranges[sessionName][index].end.column - this.ranges[sessionName][index].start.column);
        var post = rawline.substr(this.ranges[sessionName][index].end.column);
        console.log('line: ' + rawline + '\npre: ' + pre + '\nmatch: ' + match + '\npost: ' + post);
        var resultline = this.htmlEncode(pre) + '<span class="' + this.options.matchclass + '">' + this.htmlEncode(match) + '</span>' + this.htmlEncode(post);
        link.innerHTML += '(' + (line + 1) + ',' + (col + 1) + ') ' + resultline + '<br/>';
        var self = this;
        link.addEventListener('click', function () {
            var index = this.getAttribute('data-index');
            self._linkSelected(index, this.parentNode);
        });
        this.target.appendChild(container);
    },

    clear: function () {
        this.target.innerHTML = '';
    },

    /**
     * this is called from the link's event listener whenever a search result link is clicked
     * @param {Number} index index to the result anchor
     * @param {Element} link the result element that was clicked
     */
    _linkSelected: function (index, link) {
        console.log("link selected for session: " + link.getAttribute('data-session') + ' at index: ' + index);
        var editor = this.editor;
        var pos = this.anchors[link.getAttribute('data-session')][index].getPosition();
        var aceRange = ace.require('ace/range').Range;

        this.currentSession = link.getAttribute('data-session');
        console.log('session changeing to: ' + this.currentSession);
        this.setSession(this.currentSession);
        editor.focus();
        editor.moveCursorTo(pos.row, pos.column);
        var range = this.ranges[link.getAttribute('data-session')][index];
        editor.selection.setRange(new aceRange(pos.row, pos.column, pos.row, range.end.column + pos.column - range.start.column));

        var links = this.target.getElementsByTagName('div'); // clear result line highlight and set for selected result
        for (l in links) {
            if (this.options['lineclass'] == links[l].className)links[l].className = '';
        }
        link.className = this.options['lineclass'];
    },

    /**
     * creates ace default searchbox as the hypersearch box with optional callback
     * @private
     */
    _acebox: function () {
        var self = this;
        // undocumented ace function, used so we can initialize on callback of searchbox load to pass to hyper-ace
        ace.config.loadModule("ace/ext/searchbox", function(e) {
            e.Search(self.editor); // set to editor component
            self.textbox = self.editor.container.getElementsByClassName('ace_search_field')[0]; // get texbox element
            self.textbox.id = 'hyperbox'; // hyperace needs id, so we set it for the search box
            self.textbox.addEventListener('keyup', function (e) { // look for tab key in search box
                if (e.keyCode == 9) {
                    if (self.searchMultiSession) {
                        self.searchSessions();
                    } else {
                        self.search();
                    }
                }
            });
            self.editor.container.getElementsByClassName('ace_search')[0].style.display = 'none';

            if(self.options) {
                if (typeof self.options.load == 'function') {
                    self.options.load(e);
                }
            }

        });

    },

    /**
     * update the session for hyper-ace and ace
     * @param {string} identifier the identifer for the session to set
     */
    setSession: function (identifier) {
        this.editor.setSession(this.sessions[identifier]);
        this.currentSession = identifier;
        console.log('session changed to: ' + identifier);
    },

    // TODO: a better way?
    htmlEncode: function (html) {
        return html
            .replace(/&/g, "&amp;").replace(/ /g, "&nbsp;")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
            .replace(/</g, "&lt;").replace(/\n/g, "<br/>")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};
