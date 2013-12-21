A hypersearch component for ace editor that allows you to search the editor and display a list of all results.  Clicking the result will take you to the proper place in the editor.  Searching accross multiple edit sessions is supported.  You can experiment with the plunk [here](http://plnkr.co/edit/60xwqi?p=preview).  See issues section for list of todo items.

Usage
=====

Create HTML
-----------

```xml
<div id="editor"></div>
<div id="hyper">
    <input type="text" id="exp"/>
    <button id="search">Search</button>
    <div id="results">results</div>
</div>
```

Reference scripts
-----------------
```xml
<!-- use these or local copy -->
<script src="http://ace.c9.io/build/src/ace.js" type="text/javascript" charset="utf-8"></script>
<script src="http://richardbondi.net/hyper-ace/hyper-ace.js"></script>
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
hyperace.create(Array(editor), 'results', 'exp');
```

Add listeners
------------

```javascript
// for jQuery if you must
// $('#search').click(function () {
document.getElementById('search').addEventListener('click', function () {
   hyperace.search();
});
```

