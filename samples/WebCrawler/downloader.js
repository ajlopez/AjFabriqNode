var	http = require('http'),
    url = require('url');
    
function createProcessor(processor)
{
    return processor.createProcessor(
        { action: 'download' },
        function (msg) {
            var link = msg.link;
            console.log('download link', link);
            var urldata = url.parse(link);
            
            options = {
                host: urldata.hostname,
                port: urldata.port,
                path: urldata.path,
                method: 'GET'
            };
            
            http.get(options, function(res) { 
                    console.log('url', link);
                    res.setEncoding('utf8');
                    res.on('data', function(data) {
                        processor.post({ action: 'harvest', url: link, content: data });
                    });
               }).on('error', function(e) {
                    console.log('url', link);
                    console.log('error', e.message);
                });
        }
    );
}

module.exports.createProcessor = createProcessor;

