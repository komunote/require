define(function() {
	r.baseScripts = "/js/scripts/";	
	r.baseTemplates = "/js/views/";
});

require(["customer", "text!customer.html"/*, "../lib/i18n"*/], function(customer, customerTpl/*, i18n*/){
	
	//var tpl = customer.utils();	
console.log(customer);
	r.get('/user/1/')
	.then(function(data) {			
		var html = template(customerTpl, data);
		console.log('---------------customer.js loaded----------------');	
		console.log(html);
		console.log(r.append(html, document.body));
		//document.body.innerHTML += html;
	})
	.catch(function(error){
		console.log(error);
	});
});

r.post('/user/add', {firstname:'David', lastname:'Chabrier'})
.then(function(data) {
	console.log(data);
});