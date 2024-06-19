let running = false;

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'start') {
        console.log('Started');
        running = true;
        var searchText = request.searchText;
        var delayTime = request.delayTime;

        var xpath = `//a[contains(text(),' of ${searchText}')]`;
        console.log(xpath)
        var results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var numResults = results.snapshotLength
        if (numResults === 0) {
            console.log('No results found');
            return;
        }
        for (var i = 0; i < numResults; i++) {
            var node = results.snapshotItem(i);
            console.log(node.textContent);
        }

        function clickElementWithDelay(index) {
            if (!running || index >= numResults) return;

            var element = results.snapshotItem(index);
            console.log(element);
            element.click();

            // Send progress update to the popup
            browser.runtime.sendMessage({
                action: 'updateProgress',
                index: index+1,
                total: numResults
            });

            setTimeout(function() {
                clickElementWithDelay(index + 1);
            }, delayTime*1000);
            console.log(index);
        }

        // Start clicking elements with delay
        clickElementWithDelay(0);
    } else if (request.action === 'stop') {
        running = false;
        console.log('Stopped');
    }
});

// Add event listener for page unload to stop the script
window.addEventListener('beforeunload', function() {
    running = false;
});
