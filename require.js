var require, define, r, template;
(function () {
	'use strict';
	r = {
		baseScripts : "/",
		baseTemplates : "/",
		functions : {},
		require: function (file) 
		{
			return new Promise(
				function (resolve, reject) 
				{
					r.load(file).then(
						function (val) 
						{
							resolve(val);
						}
					).catch (
						function (error) 
						{
							console.log(error);
							reject(error);
						}
					);
				}
			);
		},
		post: function (file, data) 
		{
			return r.load(file, 'POST', data);
		},
		get: function (file, data) 
		{
			return r.load(file, 'GET', data);
		},
		put: function (file, data) 
		{
			return r.load(file, 'PUT', data);
		},
		delete: function (file, data) 
		{
			return r.load(file, 'DELETE', data);
		},
		load: function (file, method, data) 
		{
			return new Promise(
				function (resolve, reject) 
				{
					if(r.functions[file]) {
						return resolve(r.functions[file]);
					}
					
					var xhr = new XMLHttpRequest();

					xhr.onreadystatechange = function () 
					{
						if (xhr.status == 200 && xhr.readyState == 4) {							
							if (xhr.getResponseHeader('content-type')
								.indexOf('javascript') > -1) {
								return resolve(r.functions[file] = eval(xhr.responseText));									
							} 
							else if (xhr.getResponseHeader('content-type')
								.indexOf('json') > -1) {
								return resolve(r.functions[file] = JSON.parse(xhr.responseText));
							}else {
								return resolve(r.functions[file] = xhr.responseText);								
							}
						}
					};
					
					if (typeof method === 'undefined') {
						method = 'GET';
					}

					xhr.open(
						method,
						file.indexOf('text!') > -1 ?
							r.baseTemplates + file.split('text!')[1] :
							file.indexOf('/') === 0 ?
								file :
								r.baseScripts 	+ file + (file.indexOf('.js') > -1 ? ".js" : ''),
						true
					);

					xhr.setRequestHeader(
						"Content-type",
						file.indexOf('text!') > -1 ?
							"text/html" :
							"application/javascript"
					);
					
					if (method == 'POST') {
						var formData = new FormData();
						formData.append("data", data);
						xhr.send(data);
					} else {
						xhr.send();
					}					
				}
			);
		}
	};
		
	require = function (dependencies, callback) 
	{
		if(!callback) {
			callback = function(){};
		}
		return new Promise(
			function (resolve, reject) 
			{
				var promises = [];
				if (!Array.isArray(dependencies)) {
					dependencies = [dependencies];
				}

				dependencies.forEach(
					function (item) 
					{
						promises.push(
							new Promise(
								function (_resolve, _reject)
								{
									r.require(item)
									.then(
										function (val) {
										_resolve(val);
									});
								}
							)
						);
					}
				);

				Promise.all(promises)
				.then(
					function (values) 
					{
						if (values instanceof Promise) {
							values
							.then(
								function () {
									resolve(callback.apply(this, values));
								}
							);
						} else {					
							resolve(callback.apply(this, values));
						}
					}
				).catch(
					function(error) {
						console.log(error);
						reject(error);
					}
				);
			}
		);
	};

	define = function (dependencies, callback)
	{
		if (typeof dependencies === 'function') {
			return dependencies();
		}
		return new Promise(
			function (resolve, reject) 
			{
				require(dependencies, 
					function (values) 
					{
						if (Array.isArray(values)) {
							resolve(callback.apply(this, values));
						} else {
							resolve(callback(values));
						}

					}
				);
			}
		).catch (
			function (error)
			{
				console.log(error);
				reject(error);
			}
		);
	};

	template = function (tpl, values) 
	{
		function _clean(tpl) 
		{
			return tpl.replace(/{{( )*/gi, '{{').replace(/( )*}}/gi, '}}');
		}
		
		function _forEach(tpl, p) 
		{
			var row = tpl.split('{{' + p + '}}')[1].split('{{end' + p + '}}')[0];
			var rows = '', key = p.split('for-')[1];			

			for(var i in values[p]) {						
				var tmp = row;
				Object.getOwnPropertyNames(values[p][i]).forEach(
					function(_p)
					{
						tmp = tmp.replace(new RegExp('{{' + key + '.' + _p + '}}', 'gi'), values[p][i][_p]);
					}
				);
				rows += tmp;
			}
			
			return tpl.replace(row, rows)
				.replace(new RegExp('{{' + p + '}}', 'gi'), '')
				.replace(new RegExp('{{end' + p + '}}', 'gi'), '');
		}

		function _build(tpl, items)
		{
			items.forEach(
				function (p)
				{
					if (p.match(new RegExp('for-', 'gi')))
					{
						tpl =  _forEach(tpl, p);
					} else
					{
						tpl = tpl.replace(new RegExp('{{' + p + '}}', 'gi'), values[p]);
					}
				}
			);
			
			return tpl;
		}

		if (typeof tpl === 'string') {
			tpl = _clean(tpl);
			tpl = _build(tpl, Object.getOwnPropertyNames(values));
			return tpl;
		}
	}

	var script = document.currentScript;	
	if(script.dataset.main) {
		require(script.dataset.main);
	}
})();
