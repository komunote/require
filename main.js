define(function() {
	r.path.scripts = "/js/scripts/";	
	r.path.templates = "/js/views/";
});

require(["customer", "text!customer.html"], function(customer, customerTpl){
	r.get('/user/1/')
	.then(function(data) {
		var html = template(customerTpl, data);
		console.log('---------------customer.js loaded----------------');
		r.append(html, document.body);
		console.log(customer.getView());
	})
	.catch(function(error){
		console.log(error);
	});
});

r.post('/user/add', {firstname:'David', lastname:'Chabrier'})
.then(function(data) {
	//console.log(data);
});
