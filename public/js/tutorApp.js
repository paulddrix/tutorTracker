//angular modules for routes
var adminAngular = angular.module('tutorTracker',[]);

adminAngular.config(['$interpolateProvider',function($interpolateProvider){
  //set interpolateProvider to reset handlebars
	$interpolateProvider.startSymbol('((');
	$interpolateProvider.endSymbol('))');
}]);

adminAngular.controller('adminController',['$scope','$http',function($scope,$http){

}]);
adminAngular.controller('tutorController',['$scope','$http',function($scope,$http){

}]);