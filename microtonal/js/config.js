require.config({
	'baseUrl' : 'js/',
	'paths' : {
		'angular'       : 'lib/angular-1.4.4.min',
		'angular-route' : 'lib/angular-route-1.2.23.min',
		'angularAMD'    : 'lib/angularAMD-0.2.1.min'
	},
	'shim' : {
		'angularAMD' : {
			'deps' : ['angular']
		},
		'angular-route' : {
			'deps' : ['angular']
		}
	},
	'deps' : ['app']
});

