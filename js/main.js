var app = angular.module('calculator', ['ui.bootstrap']);

app.filter('zeroNull', function() {
  return function(input) {
  	if(input == undefined || input == null || isNaN(input)){
  		return "0";
  	}else{
  		return input;
  	}
  };
});

app.controller('CalculatorCtrl', ['$scope', 'ReadingStorage', function($scope, ReadingStorage) {

	$scope.charges = {};
	$scope.$watch('ReadingStorage.charges', function(){
		$scope.charges = ReadingStorage.charges;
		$scope.calculate();
	});


	$scope.oldReading = {};
	$scope.newReading = {};

	$scope.standingChargeTotal = 0;
    $scope.totalCost = "---";
	$scope.twoRate = false;

	$scope.calculate = function(){
		$scope.twoRate = !($scope.charges.nightRate == "" || $scope.charges.nightRate == undefined || $scope.charges.nightRate == null || isNaN($scope.charges.nightRate));

		var newDate = new Date($scope.newReading.date);
		var oldDate = new Date($scope.oldReading.date);
		$scope.daysUsed = (newDate - oldDate)/1000/60/60/24;

		$scope.standingChargeTotal = $scope.charges.standingCharge * $scope.daysUsed
		$scope.dayKwh = $scope.newReading.day - $scope.oldReading.day
		$scope.dayCost = $scope.dayKwh * $scope.charges.dayRate;

		$scope.nightKwh = $scope.newReading.night - $scope.oldReading.night
		$scope.nightCost = $scope.nightKwh * $scope.charges.nightRate;

		if($scope.twoRate){
			$scope.totalCost = $scope.dayCost + $scope.nightCost + $scope.standingChargeTotal;
		}else{
			$scope.totalCost = $scope.dayCost + $scope.standingChargeTotal;
		}

		// Lets use this opportunity to save the charges too
		ReadingStorage.saveCharges($scope.charges);
	};
	$scope.save = function(reading){
		if(reading.date){
			ReadingStorage.saveReading(reading);
		}
	};

	$scope.delete = function(reading){
		ReadingStorage.delete(reading);
	}

	$scope.setPrevious = function(reading){
		$scope.oldReading = reading;
		$scope.calculate();
	}

	$scope.setCurrent = function(reading){
		$scope.newReading = reading;
		$scope.calculate();
	}

	$scope.readings = {};
	$scope.$watch('ReadingStorage.readings', function(){
		$scope.readings = ReadingStorage.readings;
	});
}]);

/**
	LocalStorage service

	This stores the previously entered readings and retrieves them from LocalStorage. 
**/
app.service('ReadingStorage', function(){

	this.delete = function(reading){
		// toString the date so we're always dealing with String keys
		delete this.readings[reading.date.getTime()];
		this.saveReading();
	};

	this.saveReading = function(reading) {
		if(reading){

			// We clone the data so we don't live-update the table
			var modelToSave = {
				date: new Date(reading.date.getTime()),
				day: reading.day,
				night: reading.night
			}
        	//convert all dates into date objects (from timeMillis)
        	this.readings[modelToSave.date.getTime()] = modelToSave;
    	}
        localStorage.readings = angular.toJson(this.readings);
    };

    this.loadReadings = function () {
        var loadedReadings = angular.fromJson(localStorage.readings);
        if (loadedReadings){
        	this.readings = loadedReadings;
        	//convert all dates into date objects (from timeMillis)
        	for (var reading in this.readings){
	        	this.readings[reading].date = new Date(this.readings[reading].date);
	        };
        }
    };


    this.saveCharges = function(charges){
    	localStorage.charges = angular.toJson(charges);
    };

    this.loadCharges = function(){
    	var loadedCharges = angular.fromJson(localStorage.charges);
    	if (loadedCharges){
        	this.charges = loadedCharges;
        }
    };

    // initialise the service with localStorage, if it's present
    this.readings = {};
    this.loadReadings();

    this.charges = {};
    this.loadCharges();
});

