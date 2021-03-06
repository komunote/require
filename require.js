let require, define, r, template;
{
	'use strict';
	r = {
		path:{
			scripts : "/",
			templates : "/"
		},
		functions : {},
		events:{},
		require: f => new Promise((res, reject) =>
		{
			r.load(f).then(val =>
			{
				res(val);
			}).catch (error =>
			{
				console.log(error);
				reject(error);
			});
		}),
		post: (f, data) => r.load(f, 'POST', data),
		get: f => r.load(f, 'GET'),
		put: (f, data) => r.load(f, 'PUT', data),
		delete: (f, data) => r.load(f, 'DELETE', data),
		load: (f, method, data) => new Promise(
				function (res, reject) 
				{
					try {
						
					
						if(typeof r.functions[f] !== 'undefined') {
							return res(r.functions[f]);
						}
						
						let xhr = new XMLHttpRequest();

						xhr.onreadystatechange = function () 
						{
							if (xhr.status == 200 && xhr.readyState == 4) {							
								if (xhr.getResponseHeader('content-type')
									.indexOf('javascript') > -1) {
									return res(r.functions[f] = eval(xhr.responseText));									
								} 
								else if (xhr.getResponseHeader('content-type')
									.indexOf('json') > -1) {
									return res(r.functions[f] = JSON.parse(xhr.responseText));
								}else {
									return res(r.functions[f] = xhr.responseText);								
								}
							}
						};
						
						if (typeof method === 'undefined') {
							method = 'GET';
						}

						xhr.open(
							method,
							f.indexOf('text!') > -1 ?
								r.path.templates + f.split('text!')[1] :
								f.indexOf('/') === 0 ?
									f :
									r.path.scripts 	+ f + (f.indexOf('.js') > -1 ? ".js" : '')
						);

						xhr.setRequestHeader(
							"Content-type",
							f.indexOf('text!') > -1 ? "text/html" : "application/javascript"
						);
						
						if (typeof data !== 'undefined' && (method == 'POST' || method == 'PUT')) {
							let formData = new FormData();
							formData.append("data", data);
							xhr.send(data);
						} else {
							xhr.send();
						}					
					} catch(e){
						return reject(e);
					}
				}
			)
		,
		eventsWatcher: (el = document) => {
			['click', 'change', 'blur', 'mousein', 'mouseout']
			.forEach(type =>
				{
					let els = el.querySelectorAll(`[data-${type}]`);

					for(let i=0; i < els.length; i++) {
						els[i].addEventListener(type, window[els[i].dataset[type]], false);
					}				
				}
			);
		},
		append: (html, el = document.body) => {
			try {
				if(typeof html ==='object' && typeof el === 'string'){
					let _html = html;
					html = el;
					el = _html;
				}
				el.innerHTML += html;
				r.eventsWatcher(el);
				return el;
			}catch(e){
				return e;
			}
			
		},
		attach: (name, func) => {
			try {
				if(typeof name ==='function' && typeof func === 'string'){
					let _name = name;
					name = func;
					func = _name;
				}
				window[name]=func;
				return this;
			}catch(e){
				return e;
			}
			
		}
	};
		
	require = (dep, cb) =>
	{
		if(!cb) {
			if (typeof dep === 'function') {
				cb = dep;
				dep = [];
			} else {
				cb = function(){};
			}			
		}
		return new Promise((res, reject) =>
		{
			let promises = [];
			if (!Array.isArray(dep)) {
				dep = [dep];
			}

			dep.forEach(item =>
			{
				promises.push(new Promise((_res, _reject) =>
				{
					r.require(item)
					.then(val =>{_res(val)})
					.catch(_error => 
					{
						console.log(_error);
						__reject(_error);
					});
				}));
			});

			Promise
			.all(promises)
			.then(values =>
			{
				if (values instanceof Promise) {
					values.then(
						function () {
							res(cb.apply(this, values));
						}
					);
				} else {					
					res(cb.apply(this, values));
				}
			}).catch(error =>
			{
				console.log(error);
				reject(error);
			});
		});
	};

	define = function (dep, cb)
	{
		if (typeof dep === 'function') {
			return dep();
		}
		return new Promise((res, reject) =>
		{
			require(dep, values =>
			{
				if (Array.isArray(values)) {
					res(cb.apply(this, values));
				} else {
					res(cb(values));
				}
			});
		}).catch (error =>
		{
			console.log(error);
			reject(error);
		});
	};

	template = function (tpl, values) 
	{
		function _clean(tpl, forced) 
		{
			let tmp = tpl.replace(/{{( )*/gi, '{{').replace(/( )*}}/gi, '}}');
			if(typeof forced !== 'undefined' && forced) {
				tmp = tmp.replace(/{{[\w\.\-]*}}/gi, '');
			}
			return tmp;
		}
		
		function _forEach(tpl, p, val) 
		{
			let data, rows = '', ex,
				row = tpl.split('{{for-' + p + '}}')[1].split('{{endfor-' + p + '}}')[0];

			if(p.indexOf('.') >-1) {
				ex = p.split('.');
				data = val ? val : values[ex[0]][ex[1]];

			} else {
				data = val ? val[p] : values[p];
			}
			for(let d of data) {
				let tmp = row;
				Object.getOwnPropertyNames(d).forEach(_p =>
				{
					if(Array.isArray(d[_p])) {
						tmp = _forEach(tmp, `${ex[1]}.${_p}`, d[_p]);
					} else if(typeof d[_p] === 'object') {
						tmp = _nested(tmp, `${ex[1]}.${_p}`, d[_p]);
					} else {
						tmp = tmp.replace(
							new RegExp('{{' + p + '.' + _p + '}}', 'gi'), 
							d[_p] ? 
								d[_p] : ' ');
					}						
				});
				rows += tmp;
			}
			
			return tpl.replace(row, rows)
				.replace(new RegExp('{{for-' + p + '}}', 'gi'), ' ')
				.replace(new RegExp('{{endfor-' + p + '}}', 'gi'), ' ');
		}
		
		function _nested(tpl, p, items)
		{					
			for(let i in items){
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
						tpl = _forEach(tpl, p);
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

		
		return typeof tpl === 'string' ?
			_clean(_build(_clean(tpl), Object.getOwnPropertyNames(values)), true) : 
			false;
	}

	let script = document.currentScript || (function() {
      let scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();	
	if(script.getAttribute('data-main')) {
		require(script.getAttribute('data-main')).then(function(){			
			console.log('main script loaded');
		});
	}	
}
