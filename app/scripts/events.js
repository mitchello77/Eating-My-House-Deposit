/* exported init_map, build_map, reset_map */
/* global init_map, build_map, reset_map, suburbcombo, userResults, build_results */

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

  $('.down-arrow-container:not(.questions) svg').click(function() {
    $.fn.fullpage.moveSectionDown();
  });

  $('#questions .down-arrow-container svg, #questions .proceed-button').click(function() {
    // handle results and move on
    var idealloc;
    var salary;
    var propertytype;
    var total = 0;
    arrExpenses = []; // reset the array!
    console.log(userResults);
    for (var property in userResults) {
      if (userResults.hasOwnProperty(property)) {
        if (property.toString() === "ideallocation") {
          idealloc = userResults[property];
        } else if (property.toString() === "salary") {
          salary = userResults[property];
        } else if (property.toString() === "propertytype") {
          propertytype = userResults[property];
        } else if (property.toString().substr(0, 3) === "use") {
          var result = userResults[property];
          var expense = property.toString().substr(4);
          var price = expense_prices[expense];
          var countselected;
          console.log(result);
          if (result === true) {
            countselected = 1;
          } else if (result === false) {
            countselected = 0;
          } else {
            // count = result
            countselected = parseInt(result, 10) * 4;
          }
          price = price * countselected;
          console.log(countselected);
          console.log(price);

          // make annual
          price = price * 12;
          countselected = countselected * 12;
          // push obj to expenses
          var obj = {};
          obj.name = expense;
          obj.monthcost = price;
          obj.unitprice = expense_prices[expense];
          obj.count = countselected;
          arrExpenses.push(obj);
          total = total + price;
        }
      }
    }

    // save userResults[] to sessionStorage
    sessionStorage.setItem(ss_userResults, JSON.stringify(userResults));
    hideResultsInactive();
    showResultsLoader();
    build_expenselist();
    generate_incomegraph(salary, total);
    // move on
    $.fn.fullpage.moveSectionDown();
    $('#questions .proceed-button').addClass('hidden');
    $('#questions .down-arrow-container svg, #questions .proceed-button').off('click');
    // generate pay off time for each suburb
    calculate_payofftime(salary);
    results_ready = true; // results have finished processing
    // make the map again but pay time!
    build_map(true);
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
