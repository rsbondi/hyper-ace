A hypersearch component for ace editor.  This project is in the early stages.  You can experiment with the plunk [here](http://plnkr.co/edit/TdxBKMzCRWuw9pmMqwab?p=preview).  See todos in the hyper-ace.js file in the plunk or repository.

Usage
=====

Create HTML
-----------

```
&lt;div id="editor"&gt;&lt;/div&gt;
&lt;div id="hyper"&gt;
    &lt;input type="text" id="exp"/&gt;
    &lt;button id="search"&gt;Search&lt;/button&gt;
    &lt;div id="results"&gt;results&lt;/div&gt;
&lt;/div&gt;
```

Reference scripts
-----------------
```
&lt;script src="http://ace.c9.io/build/src/ace.js" type="text/javascript" charset="utf-8"&gt;&lt;/script&gt;
&lt;script src="hyper-ace.js"&gt;&lt;/script&gt;
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

