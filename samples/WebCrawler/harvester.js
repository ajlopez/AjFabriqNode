
var match1 = /href=\s*"([^&"]*)"/ig;
var match2= /href=\s*'([^&']*)'/ig;

function createProcessor(processor) {
    return processor.createProcessor(
        { action: 'harvest' },
        function(msg) {
            var data = msg.content;
            var source = msg.url;
            var prefix = null;
            
            var pos = source.lastIndexOf('/');
            
            if (pos >= 0)
                prefix = source.substring(0, pos + 1);
                
            var links;
            
            while ((links = match1.exec(data)) !== null) {
                var link = links[1];
                    if (link.indexOf(':') < 0 && prefix)
                      link = prefix + link;
                        
                    if (link.indexOf('http:') == 0)
                        processor.post({ action: 'resolve', link: link });
            };

            while ((links = match2.exec(data)) !== null) {
                var link = links[1];
                    if (link.indexOf(':') < 0 && prefix)
                      link = prefix + link;
                        
                    if (link.indexOf('http:') == 0)
                        processor.post({ action: 'resolve', link: link });
            };
        }
    );
}

module.exports.createProcessor = createProcessor;

