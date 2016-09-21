
var	sampleSrv = angular.module("sampleSrv",	[]);

// Call to Node.js backend to call PM Service instance
sampleSrv.factory("dataServices", ['$http',
function($http)	{

	this.getScore	=	function(context, p) {
		/* create the scoring input object */
		var input = {
		    tablename: 'scoreInput',			
			header: [ 'AGE', 'SEX', 'FAMILYHISTORY', 'SMOKERLAST5YRS', 'EXERCISEMINPERWEEK', 'CHOLESTEROL', 'BMI', 'AVGHEARTBEATSPERMIN', 'PALPITATIONSPERDAY'  ],				
			data: [[ p.AGE, p.SEX, p.FAMILYHISTORY, p.SMOKERLAST5YRS, p.EXERCISEMINPERWEEK, p.CHOLESTEROL, p.BMI, p.AVGHEARTBEATSPERMIN, p.PALPITATIONSPERDAY ]]
		};
   
		/* call	scoring service	to generate results */
		return $http({	method: "post",
										url: "score",
                    data: { context: context, input: input } 
                 })		
			.success(function(data, status, headers, config) {
				return data;
			})
			.error(function(data, status, headers, config) {
				return status;
			});
	}

	return this;
}]);

// The modal dialogs for results and error
sampleSrv.factory("dialogServices",	['$modal', 
function($modal) {

	this.resultsDlg	=	function (r) {	
        var prettyHeader = ['Age','Sex', 'Family History?','Smoker','Exercise/week','Cholesterol','BMI','Avg Beats/min','Palpitations per day','Heart failure risk ?','Confidence'];	
		return $modal.open({
			templateUrl: 'partials/scoreResults.html',
			controller:	'ResultsCtrl',
			size:	'lg',
			resolve: {
				rspHeader: function	() {
					//return r[0].header;	
					return prettyHeader;
				},
				rspData: function	() {
					return r[0].data;	
				}
			}
		});		
	}
	
	this.errorDlg = function(msgTitle,	msgText) {
		return	$modal.open({
			templateUrl: 'partials/error.html',
			controller:	'ErrorCtrl',
			size:	'lg',
			resolve: {
				msgTitle:	function ()	{
					return msgTitle;
				},
				message: function	() {
					return msgText;
				}
			}
		});		
	}

	return this;
}]);
