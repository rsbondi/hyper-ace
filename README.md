A hypersearch component for ace editor.  This project is in the early stages.  You can experiment with the plunk [here](http://plnkr.co/edit/TdxBKMzCRWuw9pmMqwab?p=preview).  See todos in the hyper-ace.js file in the plunk or repository.

Usage
=====

Create HTML
-----------

```
<div id="editor"></div>
<div id="hyper">
    <input type="text" id="exp"/>
    <button id="search">Search</button>
    <div id="results">results</div>
</div>
```

Reference scripts
-----------------
```
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

