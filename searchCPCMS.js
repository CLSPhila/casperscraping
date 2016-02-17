// TODO
// first, this is untested.  
// second, there is a problem in MDJ once you search--there is no span around the DOB or the docket number
// so I have to find a different way to find those fields.  Why is this so much diffeernt than CP search?


var utils = require('utils');
var casper = require('casper').create()
casper.options.verbose = true;
casper.options.logLeval = "debug";


// test data, overwritten if there is input to the script
var nameInfo = {lastName: "Smith",
                firstName: "John",
                DOB: "08/29/1985",
                numRecords: 23};
var mdj = false;

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
docketWebsite = "https://ujsportal.pacourts.us/DocketSheets/CP.aspx#";


var mdjNameControls = {lastName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphSearchControls$udsParticipantName$txtLastName", 
                       firstName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphSearchControls$udsParticipantName$txtFirstName",
                       DOB: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphSearchControls$udsParticipantName$dpDOB$DateTextBox",
                       startDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphSearchControls$udsParticipantName$DateFiledDateRangePicker$beginDateChildControl$DateTextBox",
                       endDate: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphSearchControls$udsParticipantName$DateFiledDateRangePicker$endDateChildControl$DateTextBox"
};
var mdjButtonField = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$btnSearch";
var mdjSearchTypeListControl = "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$ddlSearchType";
var mdjParticipantSelect = "ParticipantName";
var mdjDocketWebsite = "https://ujsportal.pacourts.us/DocketSheets/MDJ.aspx";


var aDocketInfo = [new Array(), new Array(), new Array(), new Array()]

var statusCodes = {
    success: 0,
    noDocketsFound: 1,
    failure: 2
}

var resultFormats = {
    json: 0,
    pipes: 1,
}

var scrapeResults = {
    statusCode: statusCodes.failure,
    dockets: []
}

function DocketInfo (num, stat, OTN, DOB) {
    //prototype for docket information
    this.num = num;
    this.stat = stat;
    this.OTN = OTN;
    this.DOB = DOB;
}//end of DocketInfo()

function objectifyDockets(nums, statuses, OTNs, DOBs) {
    //Input: Four arrays--docket numbers, statuses, OTNS, and dates of birth
    //Output: an array of docket objects.
    //TODO: Should I declare the docket object prototype inside this function? JS is confusing.
    var docketArray = []
    if ( (nums.length != statuses.length) || (nums.length != OTNs.length) || (nums.length != DOBs.length) ) {
        throw new Error("docket arrays not the same length. That's weird.");
    }
    for (var i=0; i<nums.length; i++) {
        docketArray.push(new DocketInfo(nums[i],statuses[i],OTNs[i],DOBs[i])  )
    }
    return docketArray


}//end of objectify Dockets


// get the case information from all of the CP csaes
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

    if (this.exists("a[href*='casePager$ctl07']") && !casper.cli.has("limit"))
    {
        // call the next page button
        casper.evaluate(function() {
            setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchResultsGridControl$casePager$ctl07\',\'\')', 0);
         });
        casper.wait(3000);
        casper.then(getCaseInformation);
    }
}

// get case information from all of the MDJ cases
function getCaseInformationMDJ()
{
    casper.echo("In here");
    // find all of the docketnumbers, statuses, OTNs and DOBs; id$= is a wildcard search that finds any id ending with docketNumberLable
    //var tmpDocketNumbers =casper.getElementsInfo("span[id$='docketNumberLabel']");
    //var tmpStatus = casper.getElementsInfo("span[id$='caseStatusNameLabel']");
    //var tmpOTN = casper.getElementsInfo("span[id$='otnLabel']");
    //var tmpDOB = casper.getElementsInfo("span[id$='primaryParticipantDobLabel']");
    //aDocketInfo[0] = aDocketInfo[0].concat(tmpDocketNumbers.map(function(value,index) { return value['text'];}));
    //aDocketInfo[1] = aDocketInfo[1].concat(tmpStatus.map(function(value,index) { return value['text'];}));
    //aDocketInfo[2] = aDocketInfo[2].concat(tmpOTN.map(function(value,index) { return value['text'];}));
    //aDocketInfo[3] = aDocketInfo[3].concat(tmpDOB.map(function(value,index) { return value['text'];}));

    //if (this.exists("a[href*='casePager$ctl07']") && !casper.cli.has("limit"))
    //{
    //    // call the next page button
    //    casper.evaluate(function() {
    //        setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchResultsGridControl$casePager$ctl07\',\'\')', 0);
    //     });
    //    casper.wait(3000);
    //    casper.then(getCaseInformation);
//    }
}

function printPipes(data) {
//given the scrapeResults object described above, 
    //print to the console the results in a pipe delimited format
    //N.B. In this format, the scraped docket information is printed as a markdown table.
    casper.echo("Status: " + data.statusCode);
    if (casper.cli.has("chatty")) casper.echo(" Docket Number | Status | OTN | DOB ");
    if (casper.cli.has("chatty")) casper.echo("---|---|---|---"); 
    data.dockets.forEach(function(result, index, allResults) {
        casper.echo(result.num + " | " + result.stat + " | " + result.OTN + " | " + result.DOB);
    });
}

function printResults(dataArray, format) {
    var borderString = "===================";
    if (casper.cli.has("chatty")) casper.echo("Printing Results");
    if (casper.cli.has("chatty")) casper.echo(borderString);
    switch(format) {
        case resultFormats.json:
            if (casper.cli.has("chatty")) casper.echo("printing results in json");
            utils.dump(dataArray)
            break;
        case resultFormats.pipes:
            if (casper.cli.has("chatty")) casper.echo("printing results in pipes");
            printPipes(dataArray);
            break;
        case resultFormats.yaml:
            if (casper.cli.has("chatty")) casper.echo("printing results in yaml -- UNIMPLEMENTED");
            break;
    }
    if (casper.cli.has("chatty")) casper.echo(borderString);
}//end of printResults()

// check for and collect commandline options
if (casper.cli.has("helpMe"))
{
    casper.echo("This script navigates the AOPC website automatically.");
    casper.echo("It requires that you provide a first and last name and, optionally, a DOB.");
    casper.echo("  --first=FIRSTNAME");
    casper.echo("  --last=LASTNAME");
    casper.echo("  --DOB=DOB Note that this should be in the form MM/DD/YYYY with leading zeros.  If a DOB is missing, the script will return only the first page of results (this is to give the user some dobs to search on)");
    casper.echo("  --mdj Searches the MDJ website instead of the CP website");
    casper.echo("  --chatty Prints with lots of verbosity");
    casper.echo("  --limit Limits the output to only one page of results");
    casper.echo("  --test  If you want to run in test mode, just include this flag");
    casper.echo("  --helpMe  Prints this message");
    casper.echo("The exit status codes are:")
    utils.dump(statusCodes);
    casper.exit();
}

// check for CLI; skip ahead if this is a test
if (!casper.cli.has("test") && !casper.cli.get("test"))
{
    if (!casper.cli.has("first") && (casper.cli.get("first") !== true))
    {
        casper.echo("You neglected to include a first name");
        casper.exit();
    }

    if (!casper.cli.has("last") && (casper.cli.get("last") !== true))
    {
        casper.echo("You neglected to include a last name");
        casper.exit();
    }

    // if we got here, then all of the CLIs are where they should be; set the user settings
    // TODO: input validation on the DOB
    nameInfo.lastName = casper.cli.get("last");
    nameInfo.firstName = casper.cli.get("first");
    nameInfo.DOB = casper.cli.get("DOB");
} // end if casper.cli.has("test")


// if this is an mdj search, then change a bunch of the variables so taht we can do an MDJ search
if (casper.cli.has("mdj"))
{
    mdj = true;
    docketWebsite = mdjDocketWebsite;
    searchTypeListControl = mdjSearchTypeListControl;
    nameControls = mdjNameControls;
    buttonField = mdjButtonField;
}
if (casper.cli.has("chatty"))
{
    casper.echo("Search parameters:");
    casper.echo(utils.dump(nameInfo));
    casper.echo("-----------------");
}

casper.on('aopcSite.error', function() {
    if (!scrapeResults.hasOwnProperty('statusCode')) {
        scrapeResults.statusCode = statusCodes.failure
    }
    printResults(scrapeResults, resultFormat.pipes);
    this.exit();
})


casper.start(docketWebsite, function() {
    if (this.exists("select[name='"+searchTypeListControl+"']")) {
        this.log("Successfully found the Search Type List Control", "info");
    } else {
        this.log("Cannot find Search List Control.", "error");
        this.emit("aopcSite.error");
        return
    }
    this.evaluate(function changeToParticipant(fieldName) {
        var element = jQuery("[name='"+fieldName+"']");
        var selectedElement = jQuery("option:selected", element).removeAttr("selected");
        var participantElement = jQuery("option:contains('Participant')",element);
        participantElement.attr("selected","selected");
        __utils__.echo(participantElement);
        __utils__.echo(element.serialize());
        setTimeout('__doPostBack(\''+fieldName+'\',\'\')',0);
    }, searchTypeListControl);//end of this.evaluate
 });//end of casper.start


// Now insert the first and late name
casper.waitForSelector("[name='"+nameControls.firstName+"']", function() {
    if (this.exists("[name='"+nameControls.lastName+"']")) {
        casper.log("Participant name selected ... entering name information ... ", "info");
        casper.echo("123");
    } else {
        casper.echo("123912912929");
        this.log("Cannot find entry boxes for participant name information","error");
        this.emit("aopcSite.error");
        return
        //throw new Error("Cannot find Participant Name form");
    }

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
        jQuery(startDateSelector).val("01/01/1950");
        var date = new Date();
        sDate = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
        jQuery(endDateSelector).val(sDate);

        // find and click the submit button
        var button = jQuery("input[name='"+aButtonField+"']");
        button.click()
    }, nameInfo.firstName, nameInfo.lastName, nameInfo.DOB, nameControls.firstName, nameControls.lastName, nameControls.DOB, nameControls.startDate, nameControls.endDate, buttonField);
}, function() {
    //onTimeOut function
//    this.log("Waiting for name form to appear has timed out.");
//    scrapeResults.statusCode = statusCodes.failure
//    this.emit('aopcSite.error');
this.exit();
});//end of casper.waitForSelector



casper.waitForSelector("div[id='ctl00_ctl00_ctl00_cphMain_cphDynamicContent_cphDynamicContent_participantCriteriaControl_searchResultsGridControl_resultsPanel']",
    function getDocketNumbers()  {
        if (casper.cli.has("chatty")) console.log("Dockets have been found ... now scraping dockets ....")

        var aDocketInfo = new Array();
        if (mdj)
            casper.ten(getCaseInformationMDJ);
        else
            casper.then(getCaseInformation);

    }, //end of waitForSelector then function)
    function() {
        console.log("No dockets were found.  Either there are none to find or something is broken.");
        scrapeResults.statusCode = statusCodes.noDocketsFound
        this.emit('aopcSite.error');
    }, //end of waitForSelector onTimout function
    10000);




casper.run(function() {
    scrapeResults.dockets = objectifyDockets(aDocketInfo[0],aDocketInfo[1],aDocketInfo[2],aDocketInfo[3])
    if (scrapeResults.dockets.length===0) {
        scrapeResults.statusCode = statusCodes.noDocketsFound
    } else {
        scrapeResults.statusCode = statusCodes.success;
    }
    printResults(scrapeResults, resultFormats.pipes);
    this.exit();
});

