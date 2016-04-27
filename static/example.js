var globalTimeline;
var jsEditor, svgEditor, allEditor;

var control = {
	updateLiveContent: function(e) {
		$('#content-example-title-changed').hide();
	
		globalTimeline.clear();
		$('#content-live #code-svg').html(svgEditor.getValue());
		$('#content-live #code-js').remove()
		new Function(jsEditor.getValue())();
		allEditor.setValue($('#content-live').html());
		
		
		globalTimeline.restart();					
		console.log("Updated live content");
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
	}
};
	
(function() {
	
	window.addEventListener("load", initialize);
	
	function initialize() {	
		globalTimeline = new TimelineMax({
			onUpdate: function() {
				$('#content-control-time-slider input').data('slider').setValue(globalTimeline.totalProgress()*100);
			}
		});
		
		var sliderElement = $('#content-control-time-slider input');
		sliderElement.slider({
			formatter: function(value) {
				return value + '%';
			}
		});
		sliderElement.on("slidePause", function() {
			globalTimeline.pause();
		});
		sliderElement.on("change", function() {
			var value = sliderElement.data('slider').getValue();
			globalTimeline.totalProgress( value/100 ).pause();
		});
		sliderElement.on("slideStop", function() {
			if ($('#content-control-pause').is(":visible")) {
				globalTimeline.resume();
			}
		});
		
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
		
		loadExample();
		window.addEventListener("hashchange", loadExample);
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
		
	
	function loadExample() {
		var file = window.location.hash.substr(1);
		$('#content-live').load(file, function( response, status) {
			if ( status == "error" ) {
				$('#content-example-title-text').html("Unable to find file "+file);
			} else {
				loadExampleAdditionalInformation($('ul#content-example-selection li a[href="#'+file+'"]').text());
			}
		});
	}
	
	function loadExampleAdditionalInformation(exampleTitle) {
		svgEditor.setValue($('#content-live #code-svg').html().replace(/\n\t/g, '\n'));
		jsEditor.setValue($('#content-live #code-js').html().replace(/\n\t/g, '\n'));
		allEditor.setValue($('#content-live').html());
		
		$('#content-example-title-changed').hide();
		$('#content-example-title-text').html(exampleTitle);
	}
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		target = $(e.target).attr("href");
		$(target + ' .CodeMirror').each(function(i, e) {
			e.CodeMirror.refresh()
		});
	});
})()
	