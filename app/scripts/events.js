/* exported init_map, build_map, reset_map */
/* global init_map, build_map, reset_map suburbcombo */

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

  $('#questions .dropdown-btn').click(function() {
    var input = document.getElementById("input_suburbname");
    if (suburbcombo !== undefined && input !== undefined) {
      if (suburbcombo.ul.childNodes.length === 0) {
        console.log('1');
        if (input.validity.patternMismatch && !input.validity.valueMissing) {
          input.value = "";
          suburbcombo.minChars = 0;
          suburbcombo.evaluate();
        } else {
          suburbcombo.minChars = 0;
          suburbcombo.evaluate();
        }
      } else if (suburbcombo.ul.hasAttribute('hidden')) {
        console.log('3');
        suburbcombo.open();
      } else {
        console.log('4');
        suburbcombo.close();
      }
    }
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
