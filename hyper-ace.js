// plunk: http://plnkr.co/edit/TdxBKMzCRWuw9pmMqwab?p=preview

var hyperace = {
    editors:      Array(),
    target:       null,
    textbox:      null,
    activeEditor: 0,
    ranges:       null,
    options:      null,
    selected:     0,


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

    set: function(options) {
        var editor = this.editors[this.activeEditor];
        editor.$search.set(options);
    },

    // options.regExp, options.wholeWord, options.caseSensitive
    search: function () {
        console.log('hypersearch activated for expression: '+this.textbox.value);
        var editor = this.editors[this.activeEditor];
        var found = editor.findAll(this.textbox.value);
        editor.clearSelection();
        this.ranges = editor.getSelection().getAllRanges();
        console.log(JSON.stringify(this.ranges));
        editor.exitMultiSelectMode();
        this.target.innerHTML = '';
        var self = this;
        for (r = 0; r < this.ranges.length; r++) {
            if(self.ranges[r].start.row == self.ranges[r].end.row && self.ranges[r].start.column == self.ranges[r].end.column)
                continue; // empty result
            var line = this.ranges[r].start.row;
            console.log('found row index ' + r + ' @ line: ' + line);
            var link = document.createElement('a');
            link.href = '#';
            link.setAttribute('link-index', r);
            var rawline = editor.getSession().getLine(line);
            var pre = rawline.substr(0,self.ranges[r].start.column );
            var match = rawline.substr(self.ranges[r].start.column, self.ranges[r].end.column - self.ranges[r].start.column);
            var post = rawline.substr(self.ranges[r].end.column );
            console.log('line: '+rawline+'\npre: ' + pre + '\nmatch: ' + match + '\npost: ' + post);
            var resultline = this.htmlEncode(pre) + '<span class="'+this.options.matchclass+'">'+this.htmlEncode(match)+'</span>' + this.htmlEncode(post)+ '<br/>';
            link.innerHTML += (line + 1) + ': ' + resultline;
            link.addEventListener('click', function () {
                var r = this.getAttribute('link-index');
                self.gorange( self.ranges[r].start.row, self.ranges[r].start.column, self.ranges[r].end.row,self.ranges[r].end.column, this )
            });
            this.target.appendChild(link);
        }
        if(this.ranges.length>0){
            // hack for no scroll when first item selected, select it by default
            editor.moveCursorTo(this.ranges[0].start.row, this.ranges[0].start.column);
            editor.find(this.textbox.value);
            this.target.getElementsByTagName('a')[0].className = this.options['lineclass'];
        }
    },

    /**
     *
     * @param r1 Number range.start.row
     * @param c1 Number range.start.column
     * @param r2 Number range.end.row
     * @param c2 Number range.end.column
     */
    gorange: function(r1, c1, r2, c2, link) {
        var editor = this.editors[this.activeEditor];
        var aceRange = ace.require('ace/range').Range;

        editor.focus();
        editor.moveCursorTo(r2, c2);
        editor.selection.setRange(new aceRange(r1, c1, r2, c2));

        var links = this.target.getElementsByTagName('a'); // clear result line highlight and set for selected result
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

