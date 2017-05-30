
var temp_sal = 50000;
var temp_expenses = 600;
function generate_incomegraph() {
  var stack_container = $('#results .coin-container');
  var graph_container = $('#results .income-graph');
  var expensecoin_count;
  var salarycoin_count;
  var expense_mod = 100;
  var salary_mod = 5000;
  var max_offset = 5; // in px
  var coin_html = '<div class="coin %s" style="z-index: %s; margin-left: %spx"></div>'
  var zindex;
  var i;

  expensecoin_count = Math.floor(temp_expenses / expense_mod);
  salarycoin_count = Math.floor(temp_sal / salary_mod);
  zindex = expensecoin_count + salarycoin_count - 1;

  for (i = 0; i < expensecoin_count; i++) {
    stack_container.append(sprintf(coin_html, 'expense', zindex, getCoinOffset(max_offset)));
    zindex --;
  }
  for (i = 0; i < salarycoin_count; i++) {
    stack_container.append(sprintf(coin_html, '', zindex, getCoinOffset(max_offset)));
    zindex --;
  }
}

function getCoinOffset(distance) {
  var _distance = distance + 1
  var value = 0;
  var caseid = Math.floor(Math.random() * 6);
  switch (caseid) {
    case 1:
      // positive int
      value = Math.floor(Math.random() * _distance) + 2;
      break;
    case 2:
      // positive int
      value = Math.floor(Math.random() * _distance) + 2;
      break;
    case 3:
      // negative int
      value = -Math.floor(Math.random() * _distance) - 2;
      break;
    case 4:
      // negative int
      value = -Math.floor(Math.random() * _distance) - 2;
      break;
    case 5:
      // no offset
      value = 0;
      break;
    default:
    value = 0;
  }
  return value;
}
