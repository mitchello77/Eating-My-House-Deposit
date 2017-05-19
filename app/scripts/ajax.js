//getAPIData('/path', function(jqXHR, settings){/* beforeSend */}, function(jqXHR, textStatus){/* error */} ,function(data, textStatus, jqXHR) {/* success */});

var getAPIData = function(query, bs, cb) {
  var url_prefix = "https://api.ripbrisbane.tk";
  var key = "?key=Ca!vin"
  if (query.indexOf('?') !== -1) {
    key = "&key=Ca!vin"
  }
  if (query.charAt(0) != '/') {
    query = '/'+query
  }
    $.ajax({
        type: 'get',
        url: url_prefix+query+key,
        cors: true,
        secure: true,
        beforeSend: bs,
        error: function(jqXHR, textStatus, error){
          console.log("Arax Request Failed:");
          console.log(jqXHR.responseText);
          console.log(textStatus);
          console.log(error);
          console.log("--------------------");
        },
        success: cb
    });
};
