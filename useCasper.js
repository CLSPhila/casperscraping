// test data
var nameInfo = {lastName: "Smith", 
                firstName: "John",
                DOB: "08/29/1985",
                numRecords: 23};

// field names
var nameControls = {lastName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$lastNameControl",
                    firstName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$firstNameControl",
                    DOB: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateOfBirthControl$DateTextBox",
                    startDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateFiledControl$beginDateChildControl$DateTextBox",
                    endDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$dateFiledControl$endDateChildControl$DateTextBox"};

var buttonField = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchCommandControl";

var searchTypeListControl = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl";
var participantSelect = "Aopc.Cp.Views.DocketSheets.IParticipantSearchView, CPCMSApplication, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null";
var docketNumberLabelId = "ctl00_ctl00_ctl00_cphMain_cphDynamicContent_cphDynamicContent_participantCriteriaControl_searchResultsGridControl_caseList_ctl00_ctl00_docketNumberLabel"
var aDocketInfo = [new Array(), new Array(), new Array(), new Array()]
//TODO: Global namespace pollution, a smidge. Once we know all the selectors we need,
//      then mayhap it'd be useful to put all this into some kind of nested literal bject. 

function writeHTMLToFile(file, data)
{
    var fs = require('fs');
    fs.write(file, data, 'w');
}

function getCaseInformation()
{
    // find all of the docketnumbers, statuses, OTNs and DOBs; id$= is a wildcard search that finds any id ending with docketNumberLable
    var tmpDocketNumbers =casper.getElementsInfo("span[id$='docketNumberLabel']");                          
    var tmpStatus = casper.getElementsInfo("span[id$='caseStatusNameLabel']");                              
    var tmpOTN = casper.getElementsInfo("span[id$='otnLabel']");                                            
    var tmpDOB = casper.getElementsInfo("span[id$='primaryParticipantDobLabel']");                          
    aDocketInfo[0] = aDocketInfo[0].concat(tmpDocketNumbers.map(function(value,index) { return value['text'];}));      
    aDocketInfo[1] = aDocketInfo[1].concat(tmpStatus.map(function(value,index) { return value['text'];}));                        
    aDocketInfo[2] = aDocketInfo[2].concat(tmpOTN.map(function(value,index) { return value['text'];}));                           
    aDocketInfo[3] = aDocketInfo[3].concat(tmpDOB.map(function(value,index) { return value['text'];}));                           

    // for testing purposes, dump the docket info to the command line
    // require('utils').dump(aDocketInfo);                                             
    
    // TODO - what should I do with aDocketInfo?  It would be nice to have one object that has all of 
    // our aDocketInfo on it, but that may not be possible.  I don't know that I can use the same
    // aDocketInfo in every call here (could there be a global aDocketInfo?).  Perhaps just write to a file
    // each time?  We are going to have to dump to a file at some point anyway.  
    
//    writeHTMLToFile("page3.html", this.getPageContent());
    if (this.exists("a[href*='casePager$ctl07']"))
    {
        console.log("im recursing!");
        // call the next page button
        casper.evaluate(function() { 
            setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchResultsGridControl$casePager$ctl07\',\'\')', 0);
         });
        casper.wait(3000);
        casper.then(getCaseInformation);
    }
    else
        console.log("no more recursing");
}

/*
var casper = require("casper").create({
	verbose:true,
	logLevel:"debug"
});
*/

//casper.options.waitTimeout = 20000; 
casper.options.verbose = true;
casper.options.logLeval = "debug";

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
        
        var aDocketInfo = new Array();
        casper.then(getCaseInformation);

/*
        this.capture("02.png");
        // scrape docket numbers from each page
        //TODO: consider doing this loop outside of the .waitforselector callback. 
        //      It could, instead, be a loop of casper.then(callback) functions.
        var spans = this.evaluate(function() {
            var spanCollector = []
            //for preventing infinite loops
            var numPages = 1
            var maxPages = 5
            do {
                var tempSpans = jQuery("[id*='docketNumberLabel']").map(function(index, span) {return jQuery(span).text()})
                //tempSpans is a "pseudoarray", so doesn't have nice array methods like "join", so use $.makeArray
                spanCollector = spanCollector.concat(jQuery.makeArray(tempSpans))
                
                //if there's another page, go to it.
                // The next link will have an href value if its active, and a attribute "disabled" that equals "disabled" if
                // there is no next page. 
                var hasMorePages = false;
                if (jQuery("a[href*='casePager$ctl07']").length > 0) {
                    hasMorePages = true;
                    numPages += 1
                    setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchResultsGridControl$casePager$ctl07\',\'\')', 0);
                }
            } while (hasMorePages && numPages <= maxPages) //end do while
            return spanCollector
        })//end of .evaluate
        console.log("Spans?");
        console.log(spans.join(", "))
        this.test.assert(spans.length===nameInfo.numRecords, "spans is length " + spans.length + 
                            " but is should be " + nameInfo.numRecords);
                            */
    }, //end of waitForSelector then function)
    function() {
        this.capture("02.png");
        console.log("tired of waiting.");
    }, //end of waitForSelector onTimout function
    20000);

casper.run(function() {
//    require('utils').dump(casper.test.getFailures());
    require('utils').dump(aDocketInfo);                                             
    this.exit();
});
