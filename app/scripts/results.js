var temp_sal, temp_expense;
function generate_incomegraph(sal, total_expenses) {
  showResultsLoader();
  if (sal === undefined && total_expenses === undefined) {
    // called to only rebuild casue of view port change
    if (!$('#results .not-ready').parent().hasClass('hidden')) {
      return
    }
    sal = temp_sal;
    total_expenses = temp_expense;
  }

  temp_sal = sal;
  temp_expense = total_expenses;
  var _salary = parseInt(sal, 10);
  var _expenses = parseInt(total_expenses, 10);
  var _repayments = _salary * 0.2; // 20% of salary
  var stack_container = $('#results .coin-container');
  stack_container.html(''); // remove any html inside
  var graph_container = $('#results .income-graph');
  var info_container = $('#results .income-graph .info');
  info_container.html(''); // remove any html inside
  var expensecoin_count;
  var salarycoin_count;
  var repayment_count;
  var coin_side_height = 20.64; // in px
  var coin_svg_height = 81; // in px
  var max_coins = Math.floor((graph_container.height() -  (coin_svg_height * 0.5)) / coin_side_height);
  var info_container_height = info_container.height();
  var max_offset = 8; // in px
  var coin_html = '<div class="coin %s" style="z-index: %s; margin-left: %spx"></div>';
  var line_html = '<div class="line %s" style="bottom: %s;"><span class="label">%s</span><span class="value">$%s</span></div>';
  var zindex;
  var i;

  var total = _salary + _expenses + _repayments;

  var salary_percentage = (_salary / total) * 100;
  var repay_percentage = (_repayments / total) * 100;
  var expense_percentage = (_expenses / total) * 100;

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

  // Generate Lines
  info_container.append(sprintf(line_html, 'salary', getLineHeight(salarycoin_count, coin_svg_height, coin_margin, info_container_height) + '%', 'Salary', _salary))
  info_container.append(sprintf(line_html, 'repay', getLineHeight(salarycoin_count + repayment_count, coin_svg_height, coin_margin, info_container_height) + '%', 'Morgage Repayment', _repayments))
  info_container.append(sprintf(line_html, 'expenses', getLineHeight(salarycoin_count + repayment_count + expensecoin_count, coin_svg_height, coin_margin, info_container_height) + '%', 'Expenses', _expenses))

  hideResultsLoader();
}

function getLineHeight(coin_count, coin_svg_height, coin_margin, info_container_height) {
  return ((coin_count * (coin_svg_height - coin_margin)) / info_container_height) * 100;
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

var build_expenselist = function() {
  var container = $('#results .expenses-list');
  var html = '<div class="expense"><div class="icon %s"></div><hr><div class="amount">$%s</div></div>';
  var total_html = '<div class="expense"><div class="total-label">Total:</div><div class="total-amount">$%s</div></div>';
  var total = 0;
  $.each(arrExpenses, function(index, item) {
    container.append(sprintf(html, item.name, item.monthcost));
    total = total + item.monthcost;
  });
  container.append(sprintf(total_html, total));
};

function showResultsLoader() {
  $('#results .loader').parent().removeClass('hidden');
}

function hideResultsLoader() {
  $('#results .loader').parent().addClass('hidden');
}

function hideResultsInactive() {
  $('#results .not-ready').parent().addClass('hidden');
}
