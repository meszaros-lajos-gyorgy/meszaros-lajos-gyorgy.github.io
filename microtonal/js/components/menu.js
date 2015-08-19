define('components/menu', ['app'], function(app){
	app.directive('menu', [function(){
		return {
			restrict    : 'E',
			templateUrl : 'js/components/menu.template.html',
			link        : function(scope, element, attr){
				scope.isActive = function(pattern){
					return new RegExp('^' + pattern).test(location.hash);
				}
			}
		};
	}]);
});