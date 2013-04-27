
var match1 = /href=\s*"([^&"]*)"/i;
var match2= /href=\s*'([^&']*)'/i;

function createProcessor(processor) {
    return processor.createProcessor(
        { action: 'harvest' },
        function(msg) {
            var data = msg.content;
            var links = match1.exec(data);

            if (links)
                links.forEach(function(link) { 
                    if (link.indexOf('http:') == 0)
                        processor.post({ action: 'resolve', link: link });
                });

            links = match2.exec(data);

            if (links)
                links.forEach(function(link) { 
                    if (link.indexOf('http:') == 0)
                        processor.post({ action: 'resolve', link: link });
                });
        }
    );
}

module.exports.createProcessor = createProcessor;

