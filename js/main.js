var app = angular.module('calculator', []);

app.filter('zeroNull', function() {
  return function(input) {
  	if(input == undefined || input == null || isNaN(input)){
  		return "0";
  	}else{
  		return input;
  	}
  };
});

app.controller('CalculatorCtrl', function($scope) {
	var importedScope = angular.fromJson(sessionStorage.calculator);
	//$scope = importedScope ? importedScope : $scope 
	$scope.dayRate = importedScope.dayRate;
    $scope.totalCost = "---";
	$scope.twoRate = false;

	$scope.calculate = function(){
		$scope.twoRate = !($scope.nightRate == "" || $scope.nightRate == undefined || $scope.nightRate == null || isNaN($scope.nightRate));
		$scope.dayKwh = $scope.dayReading - $scope.prevDayReading;
		$scope.dayCost = $scope.dayKwh * $scope.dayRate;

		$scope.nightKwh = $scope.nightReading - $scope.prevNightReading;
		$scope.nightCost = $scope.nightKwh * $scope.nightRate;

		if($scope.twoRate){
			$scope.totalCost = $scope.dayCost + $scope.nightCost;
		}else{
			$scope.totalCost = $scope.dayCost
		}

		sessionStorage.calculator = angular.toJson($scope);
	}
});

