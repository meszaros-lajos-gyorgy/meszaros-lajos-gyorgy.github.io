require.config({
	baseUrl : 'js/',
	waitSeconds : 0,
	paths : {
		angular         : 'lib/angular-1.4.4.min',
		angularUIRouter : 'lib/angular-ui-router-0.2.15.min',
		angularAMD      : 'lib/angularAMD-0.2.1.min'
	},
	shim : {
		angularAMD : {
			deps : ['angular']
		},
		angularUIRouter : {
			deps : ['angular']
		}
	},
	deps : ['app']
});