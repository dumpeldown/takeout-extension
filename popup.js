document.addEventListener('DOMContentLoaded', function() {

    var runButton = document.getElementById('runButton');
    var stopButton = document.getElementById('stopButton');
    var searchTextInput = document.getElementById('searchText');
    var delayTimeInput = document.getElementById('delayTime');
    var statusMessageDiv = document.getElementById('statusMessage');
    var progressBar = document.getElementById('progressBar');
    var estimatedTime = document.getElementById('estimatedTime');
    var resetButton = document.getElementById('resetButton');

    // Load saved data from storage
    browser.storage.local.get(['searchText', 'delayTime', 'progress', 'estimate']).then(result => {
        if (result.searchText !== undefined) {
            searchTextInput.value = result.searchText;
        }
        if (result.delayTime !== undefined) {
            delayTimeInput.value = result.delayTime;
        }
        if (result.progress !== undefined) {
            progressBar.style.width = result.progress + '%';
        }
        if (result.estimate !== undefined) {
            estimatedTime.textContent = result.estimate + ' minutes';
        }
    });

    // Run button listener
    runButton.addEventListener('click', function() {
        var searchText = searchTextInput.value;
        var delayTime = parseInt(delayTimeInput.value);
        var estimate = searchText*5;

        // Send the parameters to the content script to start execution
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            if (activeTab && activeTab.title.includes('Your Google data')) {
                browser.tabs.sendMessage(tabs[0].id, {action: 'start', searchText: searchText, delayTime: delayTime, estimate: estimate});
                estimatedTime.textContent =estimate + ' minutes';
                console.log(estimate);
                statusMessageDiv.textContent = 'Script started';
                // Save parameters to storage
                browser.storage.local.set({searchText: searchText, delayTime: delayTime, progress: 0, estimate:estimate});
        
            } else {
                statusMessageDiv.textContent = 'Please open the expected page';
            }
        });
    });

    // Stop button listener
    stopButton.addEventListener('click', function() {
        // Send a message to the content script to stop execution
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            if (activeTab && activeTab.title.includes('Your Google data')) {
                browser.tabs.sendMessage(tabs[0].id, {action: 'stop'});
                statusMessageDiv.textContent = 'Script stopped';
                estimatedTime.textContent =''; // Clear the estimated time
                progressBar.style.width = '0%'; // Clear the progress bar
                // Clear the progress from storage
                browser.storage.local.remove(['progress']);
                browser.storage.local.remove(['estimate']);
            }else{
                statusMessageDiv.textContent = 'Open page where you started the script or close/reload the page to stop the script';
            }
        });

    });

    // Reset button listener
    resetButton.addEventListener('click', function() {
        // Clear local storage
        browser.storage.local.clear();

        // Set default values in inputs
        searchTextInput.value = '52';
        delayTimeInput.value = '30000';
        statusMessageDiv.textContent = 'Successfully reset'; // Clear status message
        estimatedTime.textContent = ''; // Clear estimated time
    });
});

browser.runtime.onMessage.addListener(function(message) {
    if (message.action === 'updateProgress') {
        var progress = (message.index / message.total) * 100;
        document.getElementById('progressBar').style.width = progress + '%';

        // Save the progress to storage
        browser.storage.local.set({progress: progress});
    }
});