/* global build_map, getAPIData, Awesomplete */
/* exported SuburbKmFilter */

// Globals
var arrSuburbs = [];
var userResults = {};
var arrAnchors = []; // Stores anchor strings for FullPage.js nav
var arrToolTips = []; // Stores tooltips for FullPage.js nav
var SuburbKmFilter = 5.0; // (decimal) filter active suburbs by this
var arrMapFillColours = ['#EEEEEE', '#0092CA', '#222831'];
var arrMapStrokeColours = ['#F2EEE3', '#FFB563'];
// var arrMapFillColours = ['#EDEDED', '#68868C', '#405559'];
// var arrMapStrokeColours = ['#F2EEE3', '#BAAF92'];
var suburbcombo;

var build_results = function() {
  $('#questions .slide').each(function(index, item) {
    if (this === undefined) {
    console.log("Missing data-contect on slide");
    } else {
      userResults[$(this).attr('data-context')] = null;
    }
  });
};

var hide_preloader = function() {
  $('body').removeClass('loading');
  $('#pre-loader').addClass('hidden');
};

var emphasise_selected_suburb = function() {
  var selected_suburb = $('.suburb.active').not()
  var other_suburbs = $('.suburb.active')

  if (other_suburbs.has("selected")) {
    other_suburbs.addClass("dull")
  } else { other_suburbs.removeClass("dull") }
};

(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  var get_suburb_data = function() {
     getAPIData('/suburbs?filter=5', function(jqXHR, settings) {
       /* beforeSend */
     }, function(data, textStatus, jqXHR) {
       /* success */
       $.each(data, function(index, item) {
         var obj = new Object();
         obj.SuburbName = item.Suburb;
         obj.Postcode = item.Postcode;
         obj.HousePrice = item.HousePrice;
         obj.UnitPrice = item.UnitPrice;
         if (obj.HousePrice === 0 || obj.UnitPrice === 0) {
          obj.MedianPrice = toInteger(parseInt(obj.HousePrice, 10) + parseInt(obj.UnitPrice, 10));
         } else {
          obj.MedianPrice = toInteger((parseInt(obj.HousePrice, 10) + parseInt(obj.UnitPrice, 10)) / 2);
         }
         obj.Distance = item.Distance;
         obj.Latitude = item.Latitude;
         obj.Longitude = item.Longitude;
         obj.active = false;
         obj.fillcolor = "#000";
         obj.strokecolor = "#000";
         arrSuburbs.push(obj);
       });
       // Dropdown validation
       setup_validation();
       build_map(false); // init Map
       hide_preloader();
     });
   };

   function setup_validation() {
    // Input suburb list into
    var strPattern = "";
    $.each(arrSuburbs, function(index, item) {
      $("#questions .input-container #listsuburbs").append("<li>" + item.SuburbName + "</li>");
      strPattern = strPattern + item.SuburbName + "|";
    });
    strPattern = strPattern.slice(0, -1); // trim last |
    var suburbInput = document.getElementById("input_suburbname");
    $(suburbInput).attr("pattern", strPattern);
    suburbcombo = new Awesomplete(suburbInput, {
      list: "#listsuburbs",
      minChars: 1,
      maxItems: 8
    });
    // on selection force event fire
    $('#input_suburbname').on('awesomplete-selectcomplete', function() {
      $('#input_suburbname').trigger('input');
    });
   }

   // Nav Generator
   var generate_nav = function(arrAnchors, arrToolTips) {
     var sectionCount = $('.section').length; // Int of how many sections
     var i;
     for (i = 0; i < sectionCount; i++) {
       var newElement = $('<li data-menuanchor="Section-' + (i + 1) + '"><button type="button" value="' + (i + 1) + '"></button><span>' + $('.section:nth-of-type(' + (i + 1) + ')').attr('data-tooltip') + '</span></li>');
       $('nav ul').append(newElement);
       arrAnchors.push("Section-" + (i + 1)); // Add to string array
       arrToolTips.push($('.section:nth-of-type(' + (i + 1) + ')').attr('data-tooltip'));
       var navBtnColor = $('.section:nth-of-type(' + (i + 1) + ')').attr('data-navcolour'); // get data attribute value
       if (navBtnColor) {
         newElement.css('border-color', navBtnColor); // add border color to the parent.
       } else {
         console.log("var navBtnColor undefined");
       }
     }
     $('nav li:first-of-type').addClass('active');
   };

    var build_sliders = function() {
    var rangeSalary = document.getElementById('rangeSalary');
    var rangeCoffee = document.getElementById('rangeCoffee');
    var rangeAvo = document.getElementById('rangeAvo');

    noUiSlider.create(rangeSalary, {
      start: 10000,
      step: 10000,
      range: {
        min: 10000,
        max: 200000
      },
      pips: {
        mode: 'range',
        density: 3,
        format: wNumb({
          decimals: 0,
          prefix: '$'
        })
      },
      format: wNumb({
        decimals: 0,
        thousand: ',',
        prefix: '$ '
      })
    });
      rangeSalary.noUiSlider.on('update', function(values, handle) {
        var parent = $(rangeSalary).parent();
        $(parent).find('.value').html(values[handle]);
      });

      noUiSlider.create(rangeCoffee, {
        start: 0,
        step: 1,
        range: {
          min: 0,
          max: 20
        },
        pips: {
          mode: 'range',
          density: 3,
          format: wNumb({
            decimals: 0,
          })
        },
        format: wNumb({
          decimals: 0,
          thousand: ','
        })
      });
        rangeCoffee.noUiSlider.on('update', function(values, handle) {
          var parent = $(rangeCoffee).parent();
          $(parent).find('.value').html(values[handle]);
        });

      noUiSlider.create(rangeAvo, {
        start: 0,
        step: 1,
        range: {
          min: 0,
          max: 20
        },
        pips: {
          mode: 'range',
          density: 3,
          format: wNumb({
            decimals: 0,
          })
        },
        format: wNumb({
          decimals: 0,
          thousand: ','
        })
      });
        rangeAvo.noUiSlider.on('update', function(values, handle) {
          var parent = $(rangeAvo).parent();
          $(parent).find('.value').html(values[handle]);
        });
      };



    // slider for coffee




   function toInteger(number) {
     return Math.round(  // round to nearest integer
       Number(number)    // type cast your input
     );
   }

  $(document).ready(function() { // loading done
    generate_nav(arrAnchors, arrToolTips);
    // Init Fullpage JS
    $('#fullpage').fullpage({
        lockAnchors: true,
        menu: '#main-nav',
        anchors: arrAnchors,
        navigationTooltips: arrToolTips,
        scrollBar: true,
        slidesNavigation: true,
        controlArrows: false,
        loopHorizontal: true
    });
    get_suburb_data();
    build_results();
    build_sliders();
    generate_incomegraph_percentage();
    emphasise_selected_suburb();
  });
})();
