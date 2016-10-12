var globalTimeline;
var jsEditor, svgEditor, allEditor;

var control = {
	updateLiveContent: function(e) {
		$('#content-example-title-changed').hide();
	
		globalTimeline.clear();
		var newSvgContent = svgEditor.getValue();
		var newJsContent = jsEditor.getValue();
		
		// Update live view
		$('#content-live #code-svg').html(newSvgContent);
		$('#content-live #code-js').html(newJsContent); // this is needed to later save js to localStorage
		new Function(newJsContent)(); // this is needed for js execution
				
		// Update editor tab 'all'
		var original = $(document.createElement( 'div' ));
		original.html(allEditor.getValue());
		original.find('#code-svg').html(newSvgContent);
		original.find('#code-js').html(newJsContent);
		var newContent = original.html();
		
		localStorage.setItem(control.getFile(), newContent);
		allEditor.setValue(newContent);
		
		globalTimeline.restart();					
		console.log("Updated live content");
		$('#content-control-reset').show();
	},
	
	updateSlider: function() {
		$('#content-control-time-slider input').data('slider').setValue(globalTimeline.totalProgress()*100);
	},
	
	pauseTimeline: function() {
		globalTimeline.pause();
		$('#content-control-resume').show();
		$('#content-control-pause').hide();
	},
	
	resumeTimeline: function() {
		globalTimeline.resume();
		$('#content-control-resume').hide();
		$('#content-control-pause').show();
	},
	
	getFile: function() {
		return window.location.hash.substr(1);
	},
	
	resetExample: function() {
		localStorage.removeItem(control.getFile());
		control.loadExample();
		$('#content-control-reset').hide();
	},
	
	loadExample: function() {
		var file = control.getFile();
		if (!file) {
			return;
		}
		
		if (localStorage.getItem(file)) {
			$('#content-control-reset').show();
			$('#content-live').empty().append(localStorage.getItem(file)).promise().done(function() {;
				updateMeta(file, localStorage.getItem(file));
			});
		} else {
			$('#content-live').load(file, function( response, status) {
				if ( status == "error" ) {
					$('#content-example-title-text').html("Unable to find file "+file);
				}
				updateMeta(file, response, true);
			});
		}
		function updateMeta(file, content, doUnindent) {
			var original = $(document.createElement( 'div' ));
			original.html(content);
			var svgContent = original.find('#code-svg').html();
			var jsContent = original.find('#code-js').html();
			if (doUnindent) {
				svgContent = unindent(svgContent);
				jsContent = unindent(jsContent);
			}
			svgEditor.setValue(svgContent);
			jsEditor.setValue(jsContent);
			allEditor.setValue(content);
			
			$('#content-example-title-changed').hide();
			var exampleTitle = $('ul#content-example-selection li a[href="#'+file+'"]').text();
			$('#content-example-title-text').html(exampleTitle);
		}
		function unindent(content) {
			return content.replace(/\n\t/g, '\n');
		}
	},
	
	saveToLocalFile: function() {		
		var temporaryLink = document.createElement('a');
		temporaryLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(allEditor.getValue()));
		temporaryLink.setAttribute('download', 'svgExample.html');

		temporaryLink.style.display = 'none';
		document.body.appendChild(temporaryLink);

		temporaryLink.click();
		document.body.removeChild(temporaryLink);
	}
};
	
(function() {
	
	window.addEventListener("load", initialize);
	
	function initialize() {	
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			target = $(e.target).attr("href");
			$('.CodeMirror').each(function(i, e) {
				e.CodeMirror.refresh()
			});
		});
		
		// Initialize slider element
		var sliderElement = $('#content-control-time-slider input');
		sliderElement.slider({
			formatter: function(value) {
				return value + '%';
			}
		});
		sliderElement.on("slideStart", control.pauseTimeline);
		sliderElement.on("change", function() {
			var value = sliderElement.data('slider').getValue();
			globalTimeline.totalProgress( value/100 );
		});
		
		// Initialize code editors
		jsEditor = CodeMirror.fromTextArea($('#content-code-js textarea').get(0), {
			lineNumbers: true,
			mode: "text/javascript"
		});
		jsEditor.on('change', updateChangedStatus)
			
		svgEditor = CodeMirror.fromTextArea($('#content-code-svg textarea').get(0), {
			lineNumbers: true,
			mode: "text/html"
		});
		svgEditor.on('change', updateChangedStatus)
			
		allEditor = CodeMirror.fromTextArea($('#content-code-all textarea').get(0), {
			lineNumbers: true,
			mode: "text/html",
			readOnly: true
		});
		
		// Load example
		control.loadExample();
		window.addEventListener("hashchange", control.loadExample);
		
		initializeShortcuts();
	}
	
	function updateChangedStatus() {
		$('#content-example-title-changed').show();
	}
	
	function initializeShortcuts() {

		// Bind key shortcut Ctrl+S to updateLiveContent
		$(document).bind('keydown', function (e) {
			if (e.ctrlKey && e.keyCode == 83) {
				control.updateLiveContent();
				e.preventDefault();
			}					
		});
	}
})()
	