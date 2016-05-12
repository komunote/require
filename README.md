# require
light require js with templating feature

How to use it :

1 - load the script like that :

<script src="js/lib/require.js" data-main="js/scripts/main"></script>


2 - main.js definition :

define(function() {
	r.baseScripts = "/js/scripts/";	
	r.baseTemplates = "/js/views/";
});

require(["util", "text!util.html"], function(util, tpl){
	
	var tpl = util.utils();	
		
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
				'for:customers'	: [
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

<h1>Titre</h1>
<p>firstname : {{firstname}}</p>
<p>lastname : {{lastname}}</p>
<ul>
	{{for:customers}}
	<li><a href="#" id="{{customers.id}}">{{customers.firstname}} {{customers.lastname}}</a></li>
	{{endfor:customers}}
</ul>
