/* exported init_map, build_map, reset_map */
/* global init_map, build_map, reset_map, suburbcombo, userResults */

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

  $('#questions .decision-button').click(function() {
    if (!$(this).hasClass('selected')) {
      var parent = $(this).parent();
      if ($(parent).find('.selected').length) {
        // another button selected
        $(parent).find('.selected').removeClass('selected');
      }
      $(this).addClass('selected')
    }
  });

  $('.right-arrow-container svg').click(function() {
    // Store input
    var parentslider = $(this).parents(".slide");
    var value;
    if ($(parentslider).find(".input-container").length) {
      // has input
      var input = $(parentslider).find(".input-container input");
      value = input.val();
    } else if ($(parentslider).find(".button-container").length) {
      // has button
      var selected_button = $(parentslider).find(".button-container .selected");
      value = false;
      if ($(selected_button).find("p").html() == "Yes") {
        value = true;
      }
    }
    userResults[$(parentslider).attr('data-context')] = value || null;
    // Move on
    $.fn.fullpage.moveSlideRight();
  });

  $('#questions .dropdown-btn').click(function() {
    var input = document.getElementById("input_suburbname");
    if (suburbcombo !== undefined && input !== undefined) {
      if (suburbcombo.ul.childNodes.length === 0) {
        if (input.validity.patternMismatch && !input.validity.valueMissing) {
          input.value = "";
          suburbcombo.minChars = 0;
          suburbcombo.evaluate();
        } else {
          suburbcombo.minChars = 0;
          suburbcombo.evaluate();
        }
      } else if (suburbcombo.ul.hasAttribute('hidden')) {
        suburbcombo.open();
      } else {
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
