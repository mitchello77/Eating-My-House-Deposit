/* exported init_map, build_map, reset_map */
/* global init_map, build_map, reset_map, suburbcombo, userResults, build_results */

// All events
$(function() { // We are ready!
  // Suburb overlay close button Event
  $('#map .overlay .information .close').click(function() {
    reset_map();
  });

  $('#map .overlay .information .chart-container-global .close-small').click(function() {
    $('#map .overlay .information .chart-container-global').removeClass('expand');
  });

  // Nav button Event
  $('nav button').click(function() {
    $.fn.fullpage.moveTo($(this).val());
  });

  $('.down-arrow-container:not(.questions) svg').click(function() {
    $.fn.fullpage.moveSectionDown();
  });

  $('#questions .down-arrow-container svg, #questions .proceed-button').click(function() {
    handleResults(true);
  });

  $('#questions .reset-button').click(function() {
    userResults = {};
    if (sessionStorage.getItem(ss_userResults)) {
      sessionStorage.removeItem(ss_userResults);
    }
    build_results();
    results_ready = false;
    build_map(true);
    $.fn.fullpage.moveSlideRight();
    $('#questions .proceed-button').removeClass('hidden');
    $('#questions .down-arrow-container svg, #questions .proceed-button').on('click');
  });

  $('#questions .decision-button').click(function() {
    var parentslider = $(this).parents(".slide");
    var parent = $(this).parent();
    if (!$(this).hasClass('selected')) {
      if ($(parent).find('.selected').length) {
        // another button selected
        $(parent).find('.selected').removeClass('selected');
      }
      $(this).addClass('selected');
    }
    // Unhide button
    if ($(parentslider).find('.right-arrow-container').length) {
      $(parentslider).find('.right-arrow-container').removeClass('hidden');
    }
  });

  $('#input_suburbname').on('input', function() {
    var input = document.getElementById("input_suburbname");
    var parentslider = $(this).parents(".slide");
    if (input.validity.valid) {
      // valid input
      $(parentslider).find(".right-arrow-container").removeClass('hidden');
    } else if (!input.validity.valid) {
      // not valid input
      $(parentslider).find(".right-arrow-container").addClass('hidden');
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
      input.val("");
    } else if ($(parentslider).find(".button-container").length) {
      // has button
      var selected_button = $(parentslider).find(".button-container .selected");
      if ($(selected_button).find("p").html() === "Yes") {
        value = true;
      } else if ($(selected_button).find("p").html() === "No") {
        value = false;
      } else {
        value = $(selected_button).find("p").html();
      }
      $(selected_button).removeClass('selected');
    } else if ($(parentslider).find(".slider-container").length) {
      // has slider
      var slider = $(parentslider).find(".slider");
      value = slider[0].noUiSlider.get();
    }
    userResults[$(parentslider).attr('data-context')] = value;
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

  $('.toggle').click(function(e) {
    $(this).toggleClass('off');
  	var expenses = $('#map .overlay .expense-switch .toggle').hasClass('off');
  	if (expenses) {
  		$('#map .overlay .payoff-container .property-container .house .time').html(getTimeFromYears(arrSuburbs[currentOverviewFocus].payofftimeHouseExpense));
  		$('#map .overlay .payoff-container .property-container .unit .time').html(getTimeFromYears(arrSuburbs[currentOverviewFocus].payofftimeUnitExpense));
  	} else {
  		$('#map .overlay .payoff-container .property-container .house .time').html(getTimeFromYears(arrSuburbs[currentOverviewFocus].payofftimeHouse));
  		$('#map .overlay .payoff-container .property-container .unit .time').html(getTimeFromYears(arrSuburbs[currentOverviewFocus].payofftimeUnit));
  	}
  })

  $(window).bind('resizeEnd', function() {
    build_map(true);
    generate_incomegraph();
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
