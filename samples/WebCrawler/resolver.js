var http = require('http'),
    url = require('url');

function createProcessor(processor, link) {
    var urldata = url.parse(link);
    var hostname = urldata.hostname;

    console.log('Host:', hostname);
    
    var visited = {};
    
    return processor.createProcessor(
        { action: 'resolve' },
        function(msg) {
            var link = msg.link;
            var urldata = url.parse(link);

            if (urldata.hostname !== hostname)
                return;

            if (visited[link])
                return;

            visited[link] = true;
            
            processor.post({ action: 'download', link: link });
        }
    );
}

module.exports.createProcessor = createProcessor;