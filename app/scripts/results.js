
var temp_sal = 10000;
var temp_expenses = 1000;
var temp_repayment = temp_sal * 0.2;

function generate_incomegraph_percentage() {
  var stack_container = $('#results .coin-container');
  var graph_container = $('#results .income-graph');
  var info_container = $('#results .income-graph .info');
  var expensecoin_count;
  var salarycoin_count;
  var repayment_count;
  var coin_side_height = 20.64; // in px
  var coin_svg_height = 81; // in px
  var stack_top_padding = parseInt(stack_container.css('padding-top').slice(0, -2), 10);
  var max_coins = Math.floor((graph_container.height() -  (coin_svg_height * 0.5)) / coin_side_height);

  var max_offset = 8; // in px
  var coin_html = '<div class="coin %s" style="z-index: %s; margin-left: %spx"></div>';
  var line_html = '<div class="line %s" style="bottom: %s;"><span class="label">%s</span><span class="percent">%s</span></div>';
  var zindex;
  var i;

  var total = temp_sal + temp_expenses + temp_repayment;

  var salary_percentage = (temp_sal / total) * 100;
  var repay_percentage = (temp_repayment / total) * 100;
  var expense_percentage = (temp_expenses / total) * 100;

  expensecoin_count = Math.round(max_coins * (expense_percentage / 100));
  salarycoin_count = Math.round(max_coins * (salary_percentage / 100));
  repayment_count = Math.round(max_coins * (repay_percentage / 100));

  if (expensecoin_count == 0) {
    expensecoin_count = 1;
    salarycoin_count --;
  }
  zindex = max_coins - 1;

  for (i = 0; i < expensecoin_count; i++) {
    stack_container.append(sprintf(coin_html, 'expense', zindex, getCoinOffset(max_offset)));
    zindex --;
  }
  for (i = 0; i < repayment_count; i++) {
    stack_container.append(sprintf(coin_html, 'repay', zindex, getCoinOffset(max_offset)));
    zindex --;
  }
  for (i = 0; i < salarycoin_count; i++) {
    stack_container.append(sprintf(coin_html, '', zindex, getCoinOffset(max_offset)));
    zindex --;
  }

  var coin_margin = parseInt($('#results .coin-container .coin:not(:last-child)').css('margin-bottom').slice(1, -2), 10);

  // generate lines
  info_container.append(sprintf(line_html, 'salary', getLineHeight(true, salarycoin_count, max_coins, coin_margin, graph_container), 'Salary', salary_percentage.toFixed(2)));
  info_container.append(sprintf(line_html, 'repay', getLineHeight(false, repayment_count, max_coins, coin_margin, graph_container), 'Morgage Repayment', repay_percentage.toFixed(2)));
    info_container.append(sprintf(line_html, 'expenses', getLineHeight(false, expensecoin_count, max_coins, coin_margin, graph_container), 'Expenses', expense_percentage.toFixed(2)));
}

function getLineHeight(salary, coin_count, max_coins, coin_margin, graph_container) {
  if (!salary) {
    return (100 - (((coin_count / max_coins) * 100))) + '%'
  } else {
    return (((coin_count / max_coins) * 100) - (((coin_margin * 0.5) / graph_container.height()) * 100)) + '%'
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
