//getAPIData('/path', function(jqXHR, settings){/* beforeSend */}, function(jqXHR, textStatus){/* error */} ,function(data, textStatus, jqXHR) {/* success */});

var getAPIData = function(query, bs, er, cb) {
  var url_prefix = "https://api.ripbrisbane.tk";
  var key = "?key=Ca!vin"
    $.ajax({
        type: 'get',
        url: url_prefix+query+key,
        cors: true,
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'x-requested-with'
        },
        beforeSend: bs,
        error: er,
        success: cb
    });
};
