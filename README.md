# require
light javascript files loader with client side templating feature and late events binding

How to use it :

1 - load the script like that :

<script src="js/lib/require.js" data-main="js/scripts/main"></script>


2 - main.js definition :

// paths configuration
define(function() {
	r.baseScripts = "/js/scripts/";	
	r.baseTemplates = "/js/views/";
});

require(["util", "text!util.html"], 
	function(util, tpl){
		let tpl = util.utils();
		console.log(		
		template(tpl, {
			firstname		: "David", 
			lastname		: "Chabrier"
		})
	);
});


3 - util.js definition :

define(["text!util.html"], function (tpl) {
	return {
		utils : function() {			
			return template(tpl, {
				firstname		: "David", 
				lastname		: "Chabrier",
				'for-customers'	: [
					{
						id			: 1,
						lastname	: "Chabrier 1",
						firstname	: "David 1"						
					},
					{						
						firstname	: "David 2", 
						lastname	: "Chabrier 2",
						id			:2
					},
				]					
			});
		}
	}
});


4 - util.html template definition :

<h1>Identity</h1>
<p>firstname : {{identity.firstname}}</p>
<p>lastname : {{identity.lastname}}</p>
<p>Address:</p>
<ul>
	<li>City : {{identity.address.city}}</li>
	<li>Zipcode : {{identity.address.zipcode}}</li>
</ul>
<ul>
	{{for-identity.customers}}
	<li>
		<a href="#" data-click="{{onclick}}" id="{{identity.customers.id}}">{{identity.customers.firstname}} {{identity.customers.lastname}}</a>
		<ol>
			{{for-customers.tels}}
			<li>{{customers.tels.type}} {{customers.tels.number}} (perso:{{tels.emails.personnal}} pro:{{tels.emails.pro}})</li>
			{{endfor-customers.tels}}
		</ol>
	</li>
	{{endfor-identity.customers}}
</ul>


<ul>
	{{for-customers}}
	<li><a href="#" id="{{customers.id}}">{{customers.firstname}} {{customers.lastname}}</a></li>
	{{endfor-customers}}
</ul>
<input type="text" data-change="{{onchange}}" value="" />
<input type="button" data-click="customerButtonClick" value="click" />
