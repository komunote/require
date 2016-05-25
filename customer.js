window.customerButtonClick = function() {		
	alert('button clicked');
	console.log(this);
	
	require(["customer", "text!customer.html"], function(customer, customerTpl){
		r.get('/user/1/')
		.then(function(data) {			
			var html = template(customerTpl, data);
			console.log('---------------customer.js loaded----------------');	
			console.log(html);
			console.log(r.append(html, document.body));			
		})
		.catch(function(error){
			console.log(error);
		});
	});
};

window.customerTextChange = function() {
	alert('text changed');
	console.log(this);
}

define(["text!util.html"], function (tpl) {

	
	
	return {
		utils : function() 
		{
			return template(tpl, 
				{
					"firstname":"David--",
					"lastname":"Chabrier--",
					"for-customers":
					[
						{
							"id":1,
							"lastname":"Chabrier 1-",
							"firstname":"David 1-"
						},
						{
							"firstname":"David 2-",
							"lastname":"Chabrier 2-",
							"id":2
						}
					]
				}
			);
		}
	}
});