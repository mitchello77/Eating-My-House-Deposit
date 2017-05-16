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
  $(document).ready(function() { // loading done
    var arrAnchors = []; //Stores anchor strings for FullPage.js nav
    var arrToolTips = []; //Stores tooltips for FullPage.js nav

    //Nav Generator
    function GenerateNav() {
      var sectionCount = $('.section').length; // Int of how many sections
      var i;
      for (i=0; i<sectionCount; i++) {
        var newElement = $('<li data-menuanchor="Section-' + (i+1) + '"><button type="button" value="' + (i+1) + '"></button><span>' + $('.section:nth-of-type(' + (i+1) + ')').attr('data-tooltip') + '</span></li>')
        $('nav ul').append(newElement);
        arrAnchors.push("Section-" + (i+1)); //Add to string array
        arrToolTips.push($('.section:nth-of-type(' + (i+1) + ')').attr('data-tooltip'));
        var navBtnColor = $('.section:nth-of-type(' + (i+1) + ')').attr('data-navcolour'); // get data attribute value
        if (navBtnColor) {
          newElement.css('border-color', navBtnColor); // add border color to the parent.
        }
        else {
          console.log("var navBtnColor undefined");
        }
      };
      $('nav li:first-of-type').addClass('active');
    }
    GenerateNav();
    // Nav button Event
    $('nav button').click(function(){
      $.fn.fullpage.moveTo($(this).val());
    });

      // Fullpage JS
    $('#fullpage').fullpage({
        lockAnchors: true,
        menu: '#main-nav',
        anchors: arrAnchors,
        navigationTooltips: arrToolTips,
        scrollBar: true,
        slidesNavigation: true,
        controlArrowes: false,

    });
  });
})();
