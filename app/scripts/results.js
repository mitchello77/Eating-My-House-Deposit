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
  var _repayments = _salary * salaryRepaymentPercentage; // % of salary
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
  info_container.append(sprintf(line_html, 'salary', getLineHeight(salarycoin_count, 0, coin_svg_height, coin_margin, info_container_height) + '%', 'Salary', _salary))
  info_container.append(sprintf(line_html, 'repay', getLineHeight(salarycoin_count + repayment_count, salarycoin_count, coin_svg_height, coin_margin, info_container_height) + '%', 'Morgage Repayment', _repayments))
  info_container.append(sprintf(line_html, 'expenses', getLineHeight(salarycoin_count + repayment_count + expensecoin_count, salarycoin_count + repayment_count, coin_svg_height, coin_margin, info_container_height) + '%', 'Expenses', _expenses))

  hideResultsLoader();
}

function getLineHeight(coin_count, prev_coin_count, coin_svg_height, coin_margin, info_container_height) {
  var top = ((coin_count * (coin_svg_height - coin_margin)) / (info_container_height)) * 100;
  var bottom;
  if (prev_coin_count === 0) {
    bottom = 0;
  } else {
    bottom = ((prev_coin_count * (coin_svg_height - coin_margin)) / (info_container_height)) * 100;
  }
  return ((top - bottom) * 0.5) + bottom; // Half way between coin stack + bottom
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
  var html = '<div class="expense"><div class="icon %s"></div> <div class="expense-values"> %s <span class="times">x</span> %s <div class="equal"> = </div><div class="amount"> %s</div></div></div>';
  var total_html = '<div class="expense"><div class="total-label">Total:</div><div class="total-amount">%s</div></div>';
  var total = 0;

  $.each(arrExpenses, function(index, item) {
    var unitprice = item.unitprice;
    var count = item.count;
    unitprice = parseInt(unitprice, 10)

    container.append(sprintf(html, item.name, count, moneyFormat.to(unitprice), moneyFormat.to(parseInt(item.monthcost, 10))));
    total = total + item.monthcost;
  });
  container.append(sprintf(total_html, moneyFormat.to(total)));
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

function calculate_payofftime(salary) {
  var payoff = 0;
  $.each(arrSuburbs, function(index, item) {
    item.payofftime = getPayTime(salary, item.MedianPrice, false);
    item.payofftimeHouse = getPayTime(salary, item.HousePrice, false);
    item.payofftimeUnit = getPayTime(salary, item.UnitPrice, false);
    item.payofftimeExpense = getPayTime(salary, item.MedianPrice, true);
    item.payofftimeHouseExpense = getPayTime(salary, item.HousePrice, true);
    item.payofftimeUnitExpense = getPayTime(salary, item.UnitPrice, true);
  });
}

function getPayTime(salary, suburb_price, expense) {
  suburb_price = parseInt(suburb_price, 10)
  var total_expense = 0;
  var total_cost = suburb_price + (suburb_price * 0.04);
  if (expense) {
    $.each(arrExpenses, function(index, item) {
      total_expense = total_expense + item.monthcost;
    });
  }
  var annual_repayment = (salary - total_expense) * salaryRepaymentPercentage;
  return (total_cost / annual_repayment).toFixed(3);
}

function handleResults(fromevent) {
  // handle results and move on
  var idealloc;
  var salary;
  var propertytype;
  var total = 0;
  arrExpenses = []; // reset the array!
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
        if (result === true) {
          countselected = 1;
        } else if (result === false) {
          countselected = 0;
        } else {
          // count = result
          countselected = parseInt(result, 10) * 4;
        }
        price = price * countselected;
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
  if (fromevent) {
    // save userResults[] to sessionStorage
    sessionStorage.setItem(ss_userResults, JSON.stringify(userResults));
  }
  hideResultsInactive();
  showResultsLoader();
  build_expenselist();
  generate_incomegraph(salary, total);
  if (fromevent) {
    // move on
    $.fn.fullpage.moveSectionDown();
  }
  $('#questions .proceed-button').addClass('hidden');
  $('#questions .down-arrow-container svg, #questions .proceed-button').off('click');
  // generate pay off time for each suburb
  calculate_payofftime(salary);
  results_ready = true; // results have finished processing
  if (fromevent) {
    // make the map again but pay time!
    build_map(true);
  }
}
