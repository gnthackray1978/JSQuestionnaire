"use strict";

//var Panels, QryStrUtils, AncUtils;


$(document).bind("pageinit", function () {
    
	var fbHelper = new   FBHelper(this);

	fbHelper.generateHeader('#1', function () {
		
		var questionnaire = new Questionnaire();    
		questionnaire.init();       
	   
    });
	
	


});


