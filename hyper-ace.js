var hyperace = function () {}

hyperace.create = function (editor, target, textbox, options) {
    var hyper = {
        editor: null,      // the editor
        sessions: Array(), // array of editor sessions
        target: null,      // the dom element to append results
        textbox: null,     // where the search value is entered
        activeEditor: 0,   // index to editors array
        ranges: null,      // the results of ranges to display
        options: null,     // additional options
        anchors: Array(),  // floating anchors that we jump to when a result is selected
        currentSession: 0, // the current edit session identifier


        /**
         * Create hyperace element
         * @param editor Editor            the editor
         * @param target  string           where to display the results
         * @param textbox string           the search pattern element
         * @param options string           additional configuration
         */
        create: function (editor, target, textbox, options) {
            this.editor = editor;
            this.target = document.getElementById(target);
            this.textbox = document.getElementById(textbox);
            var self = this;
            this.options = options ? options : Array();
            if (options) {
                this.options['matchclass'] = options['matchclass'] ? options['matchclass'] : 'hyperace-match';
                this.options['lineclass'] = options['lineclass'] ? options['lineclass'] : 'hyperace-line';
            } else {
                this.options['matchclass'] = 'hyperace-match';
                this.options['lineclass'] = 'hyperace-line';
            }
            this.sessions.push(this.editor.getSession());                  // set for single session, over-ridden for multi
        },

        /**
         * set sessions for multiple session search
         * @param sessions Array<EditSession> array of ace.EditSession objects with the key as named identifier
         */
        setSessions: function (sessions) {
            this.sessions = sessions;
            for (s in this.sessions) {
                this.currentSession = s;
                console.log('initial session set to: ' + s)
                break;
            }
        },

        /**
         * set ace editor search options
         * @param options object search option
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
                // TODO: check before creating header and skip if zero mathces.  Maybe return matches from _search and append here instead?
                this.anchors[s] = [];
                var session = document.createElement('div');
                session.innerHTML = s;
                session.className = 'hyperace-session';
                this.target.appendChild(session);
                var rangecheck = editor.getSelection().getAllRanges();
                this._search(this.sessions[s], s);
                console.log('session: ' + s + ': ' + this.ranges[s].length + ' matches.')
                if (this.ranges[s].length == 0) {
                    var nogo = document.createElement('div');
                    nogo.innerHTML = 'no matches found';
                    this.target.appendChild(nogo);
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
         * @param session Session the session to search
         * @param s       string  session identifier
         * @private
         */
        _search: function (session, s) {
            console.log('hypersearch activated for expression: ' + this.textbox.value);
            var editor = this.editor;
            if (session) editor.setSession(session);
            var found = editor.findAll(this.textbox.value);
            editor.clearSelection();
            this.ranges[s] = editor.getSelection().getAllRanges();
            console.log(JSON.stringify(this.ranges[s]));
            editor.exitMultiSelectMode();
            for (r = 0; r < this.ranges[s].length; r++) {
                this.anchors[s].push(editor.getSession().getDocument().createAnchor(this.ranges[s][r].start.row, this.ranges[s][r].start.column));
                this._addResult(r, s);
            }
            if (this.ranges[s].length > 0) {
                // hack for no scroll when first item selected, select it by default
                editor.moveCursorTo(this.ranges[s][0].start.row, this.ranges[s][0].start.column);
                editor.find(this.textbox.value);
                //this.target.getElementsByTagName('div')[s ? 1:0].className = this.options['lineclass'];
            }
        },

        /**
         * add a search result to component
         * @param index int           the index where the range and anchor info is stored
         * @param sessionName string  the session indentifier for retrieving range and anchor info
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
            link.setAttribute('link-index', index);
            container.setAttribute('link-session', sessionName ? sessionName : 0);
            var rawline = editor.getSession().getLine(line);
            var pre = rawline.substr(0, this.ranges[sessionName][index].start.column);
            var match = rawline.substr(this.ranges[sessionName][index].start.column, this.ranges[sessionName][index].end.column - this.ranges[sessionName][index].start.column);
            var post = rawline.substr(this.ranges[sessionName][index].end.column);
            console.log('line: ' + rawline + '\npre: ' + pre + '\nmatch: ' + match + '\npost: ' + post);
            var resultline = this.htmlEncode(pre) + '<span class="' + this.options.matchclass + '">' + this.htmlEncode(match) + '</span>' + this.htmlEncode(post);
            link.innerHTML += '(' + (line + 1) + ',' + (col + 1) + ') ' + resultline + '<br/>';
            var self = this;
            link.addEventListener('click', function () {
                var index = this.getAttribute('link-index');
                self._linkSelected(index, this.parentNode);
            });
            this.target.appendChild(container);
        },

        clear: function () {
            this.target.innerHTML = '';
        },

        /**
         * this is called from the link's event listener whenever a search result link is clicked
         * @param r1 Number range.start.row
         * @param c1 Number range.start.column
         * @param r2 Number range.end.row
         * @param c2 Number range.end.column
         */
        _linkSelected: function (index, link) {
            console.log("link selected for session: " + link.getAttribute('link-session') + ' at index: ' + index);
            var editor = this.editor;
            var pos = this.anchors[link.getAttribute('link-session')][index].getPosition();
            var aceRange = ace.require('ace/range').Range;

            this.currentSession = link.getAttribute('link-session');
            console.log('session changeing to: ' + this.currentSession);
            this.setSession(this.currentSession);
            editor.focus();
            editor.moveCursorTo(pos.row, pos.column);
            var range = this.ranges[link.getAttribute('link-session')][index];
            editor.selection.setRange(new aceRange(pos.row, pos.column, pos.row, range.end.column + pos.column - range.start.column));

            var links = this.target.getElementsByTagName('div'); // clear result line highlight and set for selected result
            for (l in links) {
                if (this.options['lineclass'] == links[l].className)links[l].className = '';
            }
            link.className = this.options['lineclass'];
        },

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

    hyper.create(editor, target, textbox, options);
    return hyper;
}
