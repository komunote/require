define(function() {
	r.baseScripts = "/js/scripts/";	
	r.baseTemplates = "/js/views/";
});

require(["util", "text!util.html"/*, "../lib/i18n"*/], function(util, tpl2/*, i18n*/){
	console.log('---------------util.js loaded----------------');	
	var tpl = util.utils();	
//console.log(tpl);
	r.get('/user/1/')
	.then(function(data) {			
		console.log(template(tpl2, data));
	})
	.catch(function(error){
		console.log(error);
	});
});

r.post('/user/add', {firstname:'David', lastname:'Chabrier'})
.then(function(data) {
	console.log(data);
});
