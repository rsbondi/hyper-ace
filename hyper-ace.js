// TODO: apply deltas to links
// TODO: implement multiple editors, (add/remove)Editor methods
// TODO: add as a checkbox to ace's built in search
// TODO: option for regex or text search
// TODO: case insensitive

// plunk: http://plnkr.co/edit/TdxBKMzCRWuw9pmMqwab?p=preview

var hyperace = {
    editors:      Array(),
    target:       null,
    textbox:      null,
    activeEditor: 0,
    ranges:       null,


    /**
     * Create hyperace element
     * @param editors Array<Editor>    can apply to multiple editors
     * @param target  string           where to display the results
     * @param textbox string           the search pattern element
     * @param trigger string           click this to trigger search
     */
    create: function(editors, target, textbox, trigger) {
        for(e in editors) {
            this.editors.push(editors[e]);
        }
        this.target = document.getElementById(target);
        this.textbox = document.getElementById(textbox);
        var self = this;
        if(trigger)
            document.getElementById(trigger).addEventListener('click', function() {
                self.search();
            });
    },

    search: function () {
        console.log('hypersearch activated for expression: '+this.textbox.value);
        var re = new RegExp(this.textbox.value,'g');
        var editor = this.editors[this.activeEditor];
        var found = editor.findAll(re);
        this.ranges = editor.getSelection().getAllRanges();
        console.log(JSON.stringify(this.ranges));
        editor.exitMultiSelectMode();
        editor.clearSelection();
        this.target.innerHTML = '';
        var self = this;
        for (r = 0; r < this.ranges.length; r++) {
            var line = this.ranges[r].start.row;
            console.log('found row index ' + r + ' @ line: ' + line);
            var link = document.createElement('a');
            link.href = '#';
            link.setAttribute('link-index', r);
            link.innerHTML += (line + 1) + ': ' + this.htmlEncode(editor.getSession().getLine(line)) + '<br/>';
            link.addEventListener('click', function () {
                var r = this.getAttribute('link-index');
                self.gorange( self.ranges[r].start.row, self.ranges[r].start.column, self.ranges[r].end.row,self.ranges[r].end.column )
            });
            this.target.appendChild(link);
        }
    },

    /**
     *
     * @param r1 Number range.start.row
     * @param c1 Number range.start.column
     * @param r2 Number range.end.row
     * @param c2 Number range.end.column
     */
    gorange: function(r1, c1, r2, c2) {
        var editor = this.editors[this.activeEditor];
        var aceRange = ace.require('ace/range').Range;

        editor.selection.setRange(new aceRange(r1, c1, r2, c2));
        editor.moveCursorTo(r2, c2);
        editor.focus();
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

