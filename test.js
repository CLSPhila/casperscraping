
var page = require("webpage").create();
var url = "https://ujsportal.pacourts.us/DocketSheets/MC.aspx#"

page.open(url, function(status) {
    var title = page.evaluate(function() {
        return document.title
    })
    console.log(title)
    phantom.exit();
})



