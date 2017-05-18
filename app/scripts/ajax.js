//getAPIData('/path', function(jqXHR, settings){/* beforeSend */}, function(jqXHR, textStatus){/* error */} ,function(data, textStatus, jqXHR) {/* success */});

var getAPIData = function(query, bs, er, cb) {
  var url_prefix = "https://api.ripbrisbane.tk";
  var key = "?key=Ca!vin"
  if (query.charAt(0) != '/') {
    query = '/'+query
  }
    $.ajax({
        type: 'get',
        url: url_prefix+query+key,
        cors: true,
        secure: true,
        beforeSend: bs,
        error: er,
        success: cb
    });
};
