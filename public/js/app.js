/**
 *
 * This is the main Angular JavaScript module. 
 *
 * It has all the controller source
 *
 */
var bdadaysPMTester = angular.module("bdadaysPMTester", ['ui.bootstrap', 'sampleSrv']);

var	AppCtrl	=	['$scope',	'dialogServices', 'dataServices',
function AppCtrl($scope,	dialogServices, dataServices)	{
 		
	// context ID must match context Id when stream is uploaded to service
	$scope.context = 'bdadays'; 
	
	// init UI data model
	
	$scope.p = { AGE:'44',	SEX:'F', FAMILYHISTORY:'Y', SMOKERLAST5YRS: 'Y', EXERCISEMINPERWEEK:'125', CHOLESTEROL:'242', BMI:'24', AVGHEARTBEATSPERMIN: '100', PALPITATIONSPERDAY: '85'  };
		
	$scope.score = function()	{
		dataServices.getScore($scope.context, $scope.p)
		.then(
			function(rtn) {
				if (rtn.status == 200){
					// success
					console.log("score results: " + JSON.stringify(rtn.data));
					if (rtn.data.flag === undefined)
					   $scope.showResults(rtn.data);
				   else 
					  $scope.showError(rtn.data.message);
				} else {
					//failure
					$scope.showError(rtn.data.message);
				}
			},
			function(reason) {
				$scope.showError(reason);
			}
		);
	}
		
	$scope.showResults = function(rspHeader, rspData) {
		dialogServices.resultsDlg(rspHeader, rspData).result.then();
	}
		
	$scope.showError = function(msgText) {
		dialogServices.errorDlg("Error", msgText).result.then();
	}
}]

// This controller handles the results of the call to the PM Service
var	ResultsCtrl = ['$scope',	'$modalInstance',	'rspHeader', 'rspData',
function ResultsCtrl($scope,	$modalInstance, rspHeader, rspData) {
	var prettyHeader = ['Age','Sex', 'Family History?','Smoker','Exercise/week','Cholesterol','BMI','Avg Beats/min','Palpitations per day','Heart failure risk?','Confidence'];	
	var formattedData = rspData[0].slice(0,10);
	
	for (var i = 0; i < formattedData.length; i++) {
		if (formattedData[i] === 'Y') {
			formattedData[i] = 'Yes';
			continue;
		}
		if (formattedData[i] === 'N') {
			formattedData[i] = 'No';		
		}
    }

	$scope.rspData = [];
	//$scope.rspHeader = rspHeader;	
	$scope.rspHeader = prettyHeader;	
	// Format confidence
	confidence = (rspData[0][10] * 100).toFixed(2) + '%';
	formattedData.push(confidence);
	console.log('confidence is ' + confidence);	
	$scope.rspData.push(formattedData);
	
	$scope.cancel	=	function() {
		$modalInstance.dismiss();
	}
}]

// This controller handles errors returned from the  call to the PM Service
var	ErrorCtrl = ['$scope',	'$modalInstance',	'msgTitle',	'message',
function ErrorCtrl($scope,	$modalInstance,	msgTitle,	message) {

	$scope.msgTitle	=	msgTitle;
	$scope.message = message;
	
	$scope.cancel	=	function() {
		$modalInstance.dismiss();
	}
}]

bdadaysPMTester.controller("AppCtrl",	AppCtrl);
bdadaysPMTester.controller("ResultsCtrl", ResultsCtrl);
bdadaysPMTester.controller("ErrorCtrl", ErrorCtrl);


