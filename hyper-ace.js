// plunk: http://plnkr.co/edit/TdxBKMzCRWuw9pmMqwab?p=preview

var hyperace = {
    editors:      Array(),
    sessions:     Array(),
    target:       null,
    textbox:      null,
    activeEditor: 0,
    ranges:       null,
    options:      null,
    selected:     0,
    _search:     null,


    /**
     * Create hyperace element
     * @param editors Array<Editor>    can apply to multiple editors
     * @param target  string           where to display the results
     * @param textbox string           the search pattern element
     * @param options string           additional configuration
     */
    create: function(editors, target, textbox, options) {
        for(e in editors) {
            this.editors.push(editors[e]);
        }
        this.target = document.getElementById(target);
        this.textbox = document.getElementById(textbox);
        var self = this;
        this.options = options ? options : Array();
        if(options) {
            this.options['matchclass'] = options['matchclass'] ? options['matchclass'] : 'hyperace-match';
            this.options['lineclass'] = options['lineclass'] ? options['lineclass'] : 'hyperace-line';
        } else {
            this.options['matchclass'] = 'hyperace-match';
            this.options['lineclass'] = 'hyperace-line';
        }
    },

    /**
     * set sessions for multiple session search
     * @param sessions Array<EditSession> array of ace.EditSession objects with the key as named identifier
     */
    setSessions: function (sessions) {
        this.sessions = sessions;
    },

    /**
     * set ace editor search options
     * @param options object search option
     */
    set: function(options) {
        var editor = this.editors[this.activeEditor];
        editor.$search.set(options);
    },

    searchSessions: function () {
        this.target.innerHTML = '';
        var editor = this.editors[this.activeEditor];
        var hold = editor.getSession();
        for(s in this.sessions) {
            this._search(this.sessions[s]);
        }
        editor.setSession(hold);
    },

    search: function () {
        this._search();
    },

    /**
     * search the current session
     */
    _search: function (session) {
        console.log('hypersearch activated for expression: '+this.textbox.value);
        var editor = this.editors[this.activeEditor];
        if(session) editor.setSession(session);
        var found = editor.findAll(this.textbox.value);
        editor.clearSelection();
        this.ranges = editor.getSelection().getAllRanges();
        console.log(JSON.stringify(this.ranges));
        editor.exitMultiSelectMode();
        for (r = 0; r < this.ranges.length; r++) {
            this._addResult(r) ;
        }
        if(this.ranges.length>0){
            // hack for no scroll when first item selected, select it by default
            editor.moveCursorTo(this.ranges[0].start.row, this.ranges[0].start.column);
            editor.find(this.textbox.value);
            this.target.getElementsByTagName('div')[0].className = this.options['lineclass'];
        }
    },
    
    _addResult: function(index) {
        if(this.ranges[index].start.row == this.ranges[index].end.row && this.ranges[index].start.column == this.ranges[index].end.column)
            return; // empty result
        var line = this.ranges[index].start.row;
        var col = this.ranges[index].start.column;
        console.log('found row index ' + index + ' @ line: ' + line);
        var container = document.createElement('div');
        var link = document.createElement('a');
        container.appendChild(link);
        link.href = '#';
        link.setAttribute('link-index', index);
        var rawline = editor.getSession().getLine(line);
        var pre = rawline.substr(0,this.ranges[index].start.column );
        var match = rawline.substr(this.ranges[index].start.column, this.ranges[index].end.column - this.ranges[index].start.column);
        var post = rawline.substr(this.ranges[index].end.column );
        console.log('line: '+rawline+'\npre: ' + pre + '\nmatch: ' + match + '\npost: ' + post);
        var resultline = this.htmlEncode(pre) + '<span class="'+this.options.matchclass+'">'+this.htmlEncode(match)+'</span>' + this.htmlEncode(post);
        link.innerHTML += '('+(line + 1)+',' + (col+1) + ') ' + resultline+ '<br/>';
        var self = this;
        link.addEventListener('click', function () {
            var index = this.getAttribute('link-index');
            self._linkSelected( self.ranges[index].start.row, self.ranges[index].start.column, self.ranges[index].end.row,self.ranges[index].end.column, this.parentNode )
        });
        this.target.appendChild(container);
    },

    clear: function() {
        this.target.innerHTML = '';
    },

    /**
     *
     * @param r1 Number range.start.row
     * @param c1 Number range.start.column
     * @param r2 Number range.end.row
     * @param c2 Number range.end.column
     */
    _linkSelected: function(r1, c1, r2, c2, link) {
        var editor = this.editors[this.activeEditor];
        var aceRange = ace.require('ace/range').Range;

        editor.focus();
        editor.moveCursorTo(r2, c2);
        editor.selection.setRange(new aceRange(r1, c1, r2, c2));

        var links = this.target.getElementsByTagName('div'); // clear result line highlight and set for selected result
        for(l in links) {
            links[l].className = '';
        }
        link.className = this.options['lineclass'];
    },

    // TODO: a better way?
    htmlEncode: function(html) {
        return html
            .replace(/&/g, "&amp;").replace(/ /g, "&nbsp;")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
            .replace(/</g, "&lt;").replace(/\n/g, "<br/>")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};
