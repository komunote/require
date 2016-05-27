var require, define, r, template;
(function () {
	'use strict';
	r = {
		baseScripts : "/",
		baseTemplates : "/",
		functions : {},
		events:{},
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
		post: function(file, data){return r.load(file, 'POST', data);},
		get: function(file){return r.load(file, 'GET');},
		put: function(file, data){return r.load(file, 'PUT', data);},
		delete: function(file, data){return r.load(file, 'DELETE', data);},
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
					
					if (typeof data !== 'undefined' && (method == 'POST' || method == 'PUT')) {
						var formData = new FormData();
						formData.append("data", data);
						xhr.send(data);
					} else {
						xhr.send();
					}					
				}
			);
		},
		eventsWatcher: function(element) {
			['click', 'change'].forEach(function(type) {				
				var elements = element.querySelectorAll(`[data-${type}]`);				
				for(var i=0; i<elements.length; i++) {										
					elements[i].addEventListener(type, window[elements[i].dataset[type]], false);					
				};
			});			
		},
		append: function(html, element) {
			element.insertAdjacentHTML('beforeEnd', html);
			r.eventsWatcher(element);
			return element;
		}
	};
		
	require = function (dependencies, callback) 
	{
		if(!callback) {
			if (typeof dependencies === 'function') {
				callback = dependencies;
				dependencies = [];
			} else {
				callback = function(){};
			}			
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
									}).catch(
										function(_error) {
											console.log(_error);
											__reject(_error);
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
							values.then(
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
		
		function _forEach(tpl, p, val) 
		{
			var data, rows = '',
				row = tpl.split('{{for-' + p + '}}')[1].split('{{endfor-' + p + '}}')[0];

			if(p.indexOf('.') >-1) {
				var ex = p.split('.');
				data = val? val : values[ex[0]][ex[1]];

			} else {
				data = val ? val[p] : values[p];
			}
			for(var i in data) {
				var tmp = row;
				Object.getOwnPropertyNames(data[i]).forEach(
					function(_p)
					{
						if(Array.isArray(data[i][_p])) {
							tmp = _forEach(tmp, `${ex[1]}.${_p}`, data[i][_p]);
						} else if(typeof data[i][_p] === 'object') {

							tmp = _nested(tmp, `${ex[1]}.${_p}`, data[i][_p]);
						} else {
							tmp = tmp.replace(new RegExp('{{' + p + '.' + _p + '}}', 'gi'), data[i][_p] ? data[i][_p] : ' ');
						}
						
					}
				);
				rows += tmp;
			}
			
			return tpl.replace(row, rows)
				.replace(new RegExp('{{for-' + p + '}}', 'gi'), ' ')
				.replace(new RegExp('{{endfor-' + p + '}}', 'gi'), ' ');
		}
		
		function _nested(tpl, p, items) 
		{			
			for(var i in items){
				if(items[i] && Object.getOwnPropertyNames(items[i])){
					if(Array.isArray(items[i])) {
						tpl = _forEach(tpl, `${p}.${i}`);
					} else if(typeof items[i] === 'object') {			
						tpl = _nested(tpl, `${p}.${i}`, items[i]);
					} else {						
						tpl = tpl.replace(new RegExp(`{{${p}.${i}}}`, 'gi'), items[i] ? items[i] : ' ');
					}						
				}					
			};			
			
			return tpl;
		}

		function _build(tpl, items)
		{
			items.forEach(
				function (p)
				{
					if (Array.isArray(values[p]))
					{
						tpl =  _forEach(tpl, p);
					} else
					{
						if(typeof values[p] === 'object') {
							tpl = _nested(tpl, p, values[p]);						
						} else {
							tpl = tpl.replace(new RegExp('{{' + p + '}}', 'gi'), values[p] ? values[p] : ' ');
						}						
					}
				}
			);
			
			return tpl;
		}

		if (typeof tpl === 'string') {						
			return _build(_clean(tpl), Object.getOwnPropertyNames(values));
		}
	}

	var script = document.currentScript;	
	if(script.dataset.main) {
		require(script.dataset.main).then(function(){			
			console.log('main script loaded');
		});
	}		
})();
