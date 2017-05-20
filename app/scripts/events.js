//// All events

$(function() { // We are ready!
  // Suburb overlay close button Event
  $('#map .overlay .information .close').click(function(){
    ResetMap();
  });
  // Nav button Event
  $('nav button').click(function(){
    $.fn.fullpage.moveTo($(this).val());
  });
  $(window).bind('resizeEnd', function() {
    build_map(true);
  });
});
