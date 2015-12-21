// test data
var nameInfo = {lastName: "Smith", 
                firstName: "John",
                DOB: "08/29/1985"};

// field names
var nameControls = {lastName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$lastNameControl",
                    firstName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$firstNameControl",
                    DOB: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateOfBirthControl$DateTextBox",
                    startDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateFiledControl$beginDateChildControl$DateTextBox",
                    endDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateFiledControl$endDateChildControl$DateTextBox"};

var buttonField = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchCommandControl";

var searchTypeListControl = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl";
var participantSelect = "Aopc.Cp.Views.DocketSheets.IParticipantSearchView, CPCMSApplication, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";

function writeHTMLToFile(file, data)
{
    var fs = require('fs');
    fs.write(file, data, 'w');
}

/*
var casper = require("casper").create({
	verbose:true,
	logLevel:"debug"
});
*/

//casper.options.waitTimeout = 20000; 
casper.options.verbose = true;

casper.start("https://ujsportal.pacourts.us/DocketSheets/CP.aspx#", function() {
    // writeHTMLToFile("page1.html", this.getPageContent());
    this.test.assertExists("select[name='"+searchTypeListControl+"']", "Search type selector exists");
    
    //so I need to change the "selected" attribute of the options list and then evaluate the __doPostBack method of the options list.
    // I also have to pass in the variable b/c in evaluate, the variable scope doesn't include anything from this casper script
    this.evaluate(function changeToParticipant(fieldName) {
        var element = jQuery("[name='"+fieldName+"']");
        var selectedElement = jQuery("option:selected", element).removeAttr("selected");
        var participantElement = jQuery("option:contains('Participant')",element);
        participantElement.attr("selected","selected");
        setTimeout('__doPostBack(\''+fieldName+'\',\'\')',0);
    }, searchTypeListControl);//end of this.evaluate
 });//end of casper.start


// Now insert the first and late name
casper.waitForSelector("[name='"+nameControls.lastName+"']", function() {
    this.test.assertExists("[name='"+nameControls.lastName+"']")
    
    this.evaluate(function searchByNameDOB(aFirstName, aLastName, aDOB, aFirstNameField, aLastNameField, aDOBField, aStartField, aEndField, aButtonField){

        // put in the last name
        var lastNameSelector = "input[name='"+aLastNameField+"']"
        jQuery(lastNameSelector).val(aLastName);

        // put in the first name
        var firstNameSelector = "input[name='"+aFirstNameField+"']";
        jQuery(firstNameSelector).val(aFirstName);
        
        // put in the DOB
        var DOBSelector = "input[name='"+aDOBField+"']";
        jQuery(DOBSelector).val(aDOB);

        // put in the start and end dates to search within
        var startDateSelector = "input[name='"+aStartField+"']";
        var endDateSelector = "input[name='"+aEndField+"']";
        jQuery(startDateSelector).val("01/01/1900");
        var date = new Date();
        sDate = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
        jQuery(endDateSelector).val(sDate);

        // find and click the submit button
        var button = jQuery("input[name='"+aButtonField+"']");
        button.click()
    }, nameInfo.firstName, nameInfo.lastName, nameInfo.DOB, nameControls.firstName, nameControls.lastName, nameControls.DOB, nameControls.startDate, nameControls.endDate, buttonField);
});

casper.waitForSelector("div[id='ctl00_ctl00_ctl00_cphMain_cphDynamicContent_cphDynamicContent_participantCriteriaControl_searchResultsGridControl_resultsPanel']",
    function getDocketNumbers()  {
        console.log("Found selector.")
        writeHTMLToFile("page3.html", this.getPageContent());
        
        // find all of the docketnumbers; id$= is a wildcard search that finds any id ending with docketNumberLable
        var docketNumbers = casper.getElementsAttribute("span[id$='docketNumberLabel']", "innerHTML");
        require('utils').dump(docketNumbers);
        this.capture("02.png");
    }, //end of waitForSelector then function)
    function() {
        this.capture("02.png");
        console.log("tired of waiting.");
    }, //end of waitForSelector onTimout function
    20000);

casper.run(function() {
//    require('utils').dump(casper.test.getFailures());
    this.exit();
});



//javascript:setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl\',\'\')', 0)


