var nameInfo = {lastName: "Smith", firstName: "John"}

var nameControls = {lastName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$lastNameControl",
                    firstName: "ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$firstNameControl"}


var casper = require("casper").create({
	verbose:true,
	logLevel: 'debug'
});

casper.start("https://ujsportal.pacourts.us/DocketSheets/CP.aspx#", function() {
    this.test.assertExists("select[name='ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl'], 'Selector exists'");
    //so I need to change the "selected" attribute of the options list and then evaluate the __doPostBack method of the options list.
    works = this.evaluate(function() {
        var element = jQuery("[name='ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl']");
        var selectedElement = jQuery("option:selected", element).removeAttr("selected");
        var participantElement = jQuery("option:contains('Participant')",element);
        participantElement.attr("selected","selected");
        setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl\',\'\')', 0);
    });//end of this.evaluate
});//end of casper.start


casper.waitForSelector("[name='"+nameControls.lastName+"']", function() {
    this.test.assertExists("[name='"+nameControls.lastName+"']")
    this.evaluate(function(){
        var lastNameSelector = "input[name='ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$lastNameControl']"
        jQuery(lastNameSelector).val("Smith");

        var firstNameSelector = "input[name='ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$firstNameControl']"
        jQuery(firstNameSelector).val("John");
        var button = jQuery("input[name='ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$participantCriteriaControl$searchCommandControl']");
        button.click()
    });
});

casper.waitForSelector("div[id='ctl00_ctl00_ctl00_cphMain_cphDynamicContent_cphDynamicContent_participantCriteriaControl_searchResultsGridControl_resultsPanel']",
    function()  {
        console.log("Found selector.")
        this.capture("02.png");
    }, //end of waitForSelector then function)
    function() {
        this.capture("02.png");
        console.log("tired of waiting.");
    }, //end of waitForSelector onTimout function
    20000);

casper.run()



//javascript:setTimeout('__doPostBack(\'ctl00$ctl00$ctl00$cphMain$cphDynamicContent$cphDynamicContent$searchTypeListControl\',\'\')', 0)


