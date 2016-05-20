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