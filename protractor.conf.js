var HtmlReporter = require('protractor-beautiful-reporter'); 
exports.config = {
	framework: "jasmine",
	SeleniumAddress: 'http://localhost:4444/wd/hub/',
	specs: [
        'Test/Translate.js'     
	],
    capabilities: {
        'browserName': 'chrome',
        
      
      },
      
	onPrepare: function() {

    // Add a screenshot reporter and store screenshots to `//screenshots`:
	jasmine.getEnv().addReporter(new HtmlReporter({
		baseDirectory: 'Report/screenshots'  // It will create the results by creating new folders under the main project folder. You can specify any forlder name of you choice
    }).getJasmine2Reporter());
    
	
    },

    jasmineNodeOpts: {
    showColors: true,
    silent: true,
    defaultTimeoutInterval: 360000,
    print: function() {

    }  

}, 
   
	

}; 