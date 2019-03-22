var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "Should translate consonants with hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00640044-009b-009d-0006-007100d600d4.png",
        "timestamp": 1553263234400,
        "duration": 1981
    },
    {
        "description": "Should translate word starts with consonant cluster without hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0039001a-00ce-0006-00df-00f9008400c0.png",
        "timestamp": 1553263236875,
        "duration": 1681
    },
    {
        "description": "Should translate  words starts with Vowels  without hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b600be-00f8-00d7-00ad-005d00420029.png",
        "timestamp": 1553263238991,
        "duration": 1684
    },
    {
        "description": "Should translate words starts with Vowels with hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002900a0-00f0-007d-00ca-008f00030009.png",
        "timestamp": 1553263241517,
        "duration": 1234
    },
    {
        "description": "Should translate words starts and ends Vowels with hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": false,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": [
            "Expected 'employee-ay' to equal 'employee-way'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (/Users/vinothavijayakumar/Desktop/Automation_for_yumpingo/Test/Translate.js:58:30)\n    at /Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/jasminewd2/index.js:112:25\n    at new ManagedPromise (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1077:7)\n    at ControlFlow.promise (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2505:12)\n    at schedulerExecute (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/jasminewd2/index.js:95:18)\n    at TaskQueue.execute_ (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2974:25)\n    at /Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "006b007e-00e2-0017-006a-005e000100e6.png",
        "timestamp": 1553263243190,
        "duration": 1621
    },
    {
        "description": "Should translate words starts and ends wtih Vowels without hyphenate |Translate the given words starts with Consonants to Pig Latin ",
        "passed": false,
        "pending": false,
        "os": "Mac OS X",
        "sessionId": "685267441d29e6e2d93afb654d9095c3",
        "instanceId": 7206,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.121"
        },
        "message": [
            "Expected 'americaay' to equal 'americaway'."
        ],
        "trace": [
            "Error: Failed expectation\n    at hyphenate.isSelected.then.selected (/Users/vinothavijayakumar/Desktop/Automation_for_yumpingo/Test/Translate.js:68:38)\n    at elementArrayFinder_.then (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/built/element.js:804:32)\n    at ManagedPromise.invokeCallback_ (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at asyncRun (/Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:2927:27)\n    at /Users/vinothavijayakumar/.npm-packages/lib/node_modules/protractor/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at <anonymous>\n    at process._tickCallback (internal/process/next_tick.js:189:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00730047-0001-0052-00af-0057009c00fd.png",
        "timestamp": 1553263245244,
        "duration": 1690
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

