r.attach('customerButtonClick', function() {
	alert('button clicked');
	console.log(this);
	
	require(["customer", "text!customer.html"], (customer, customerTpl) =>
	{
		r.get('/user/1/')
		.then(function(data) {			
			var html = template(customerTpl, data);
			console.log('---------------customer.js loaded----------------');	
			//console.log(html);			
			r.append(html, document.body);
		})
		.catch(function(error){
			console.log(error);
		});		
	});
});

r.attach('customerTextChange', function() {
	alert('text changed');
	console.log(this);
});

define(["text!customer.html"], tpl => (
	{
		getView : function() {
			return template(tpl, 
				{
					"identity":{
						"firstname":"David--",
						"lastname":"Chabrier--",
						"customers":
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
				}
			);
		}
	})		
);
