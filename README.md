A hypersearch component for ace editor that allows you to search the editor and display a list of all results.  Clicking the result will take you to the proper place in the editor.  Searching accross multiple edit sessions is supported.  You can experiment with the plunk [here](http://plnkr.co/edit/60xwqi?p=preview).  See issues section for list of todo items.

Examples
--------

Here are the examples from the examples directory

* [basic](http://richardbondi.net/hyper-ace/examples/basic/basic.html): Shows basic usage using an external textbox for searching and checkboxes for search options.
* [acebox](http://richardbondi.net/hyper-ace/examples/acebox/acebox.html): Uses the built in ace search form.
* [sessions](http://richardbondi.net/hyper-ace/examples/sessions/sessions.html): Advanced example using the built in ace search form, extending the form for hypersearch and searching accross multiple sessions.
* [instances](http://richardbondi.net/hyper-ace/examples/instances/instances.html): The 3 above examples combined on one page to show multiple instances.

Usage
=====

Create HTML
-----------

```xml
<div id="editor"></div>
<div id="hyper">
    <input type="text" id="needle"/>
    <button id="search">Search</button>
    <div id="results">results</div>
</div>
```

Reference scripts
-----------------
```xml
<!-- use these or local copy -->
<script src="http://ace.c9.io/build/src/ace.js" type="text/javascript" charset="utf-8"></script>
<script src="http://richardbondi.net/hyper-ace/hyper-ace.js"></script> <!-- or hyper-ace.min.js -->
```

Initialize ace editor
---------------------
```javascript
    // create ace editor
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
```

Initialize hyper-ace component
---------------------
```javascript
// create hyperace
var hyper = hyperace.create(editor, 'results', 'needle');
```
'needle' is the textbox used for search.  If ommited, the ace default searchbox is used and [tab] triggers the search.
When using the ace default, you can search multiple sessions by setting searchMultiSession to true or a single session by setting searchMultiSession to false.


Add listeners
------------

```javascript
// for jQuery if you must
// $('#search').click(function () {
document.getElementById('search').addEventListener('click', function () {
   hyper.search();
});
```


For multiple sessions
=====================

Create sessions
---------------

```javascript
var sessions = [];

// ex. blank editor in css mod
var session = new ace.EditSession('', {
    "path": "ace/mode/css" 
});
sessions['style.css'] = session;

// repeat for each session
```

Add sessions to hyper-ace
-------------------------

```javascript
hyper.setSessions(sessions); 
```

When switching editor sessions, just tell hyper-ace the identifier and it will switch the ace session


```javascript
hyper.setSession('style.css');
```

To search
---------

```javascript
hyper.searchSessions();
```

API
===

hyperace
--------

```javascript
create (editor, target, textbox, options)
```

Static function to create hypersearch instance

* {Editor} *editor*   the editor
* {string} *target*   where to display the results
* {string} *textbox*  the search pattern element
* {string} *options*  additional configuration
* return {hypersearch}
 
options:

* matchclass: the css fclass or highlightin matches in the result.  Default = 'hyperace=match'
* lineclass: the css class for highlighting the selected line.  Default = 'hyperace-line'
* load: callback function for default texbox loaded.


hypersearch
-----------

```javascript
clear()
```

clears search results

```javascript
search()
```

search the current session

```javascript
searchSessions()
```

search across multiple sessions

```javascript
set(options)
```

set ace editor search options

* {object} *options* search option, set any of the following to true or false ex. hyper.set({"regExp": false, "wholeWord": true});

available options: "regExp", "caseSensitive", "wholeWord"

```javascript
setSession(identifier)
```

update the session for hyper-ace and ace

* {string} *identifier* the identifer for the session to set

```javascript
setSessions(sessions)
```

set sessions for multiple session search

* {Array<EditSession>} *sessions* array of ace.EditSession objects with the key as named identifier

