define(function() {
	r.baseScripts = "/js/scripts/";	
	r.baseTemplates = "/js/views/";
});

require(["util", "text!util.html", "../lib/i18n"], function(util, tpl2, i18n){
	console.log('---------------util.js loaded----------------');	
	var tpl = util.utils();	
		
	console.log(		
		template(tpl, {
			firstname		: "David", 
			lastname		: "Chabrier"
		})
	);
});