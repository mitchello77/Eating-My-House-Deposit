/* exported init_map, build_map, reset_map */
/* global init_map, build_map, reset_map */

// All events
$(function() { // We are ready!
  // Suburb overlay close button Event
  $('#map .overlay .information .close').click(function() {
    reset_map();
  });

  // Nav button Event
  $('nav button').click(function() {
    $.fn.fullpage.moveTo($(this).val());
  });

  $('.down-arrow-container svg').click(function() {
    $.fn.fullpage.moveSectionDown();
  });

  $('.right-arrow-container svg').click(function() {
    $.fn.fullpage.moveSlideRight();
  });

  $(window).bind('resizeEnd', function() {
    build_map(true);
  });

  $(window).resize(function() {
       if (this.resizeTO) {
         clearTimeout(this.resizeTO);
       }
       this.resizeTO = setTimeout(function() {
           $(this).trigger('resizeEnd');
       }, 500);
   });
});
