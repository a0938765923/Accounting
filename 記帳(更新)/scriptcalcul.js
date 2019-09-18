// 01 新增module pattern
console.clear()
 // 04 定義DOM變數(若變數class名有更改，則只需修改此處)
 var DOMstrings = {
    // 輸入項
    inputType: '.select',
    inputItem: '.item',
    inputValue: '.value',
    inputBtn: '.btn',
    //裝入陣列項
    incomeContainer: '.income-container',
    expenseContainer: '.expense-container',
    //顯示到總表
    budgetLabel:'.netIncome',
    incomeLabel:'.income-val',
    expenseLabel:'.expense-val',
    percentageLabel: '.per.expense-per',
    delete: '.bottom',
    title: '.title',
    percentage: '.percentage'
  }
  
var budgetController = (function(){ 
  // 07 定義收入 支出原型(id / item / value)
  var Expense = function(id,item,value,type){
    this.id = id
    this.item = item
    this.value = value
    this.percentage = -1
    this.type = type
  }
  Expense.prototype.calcEveryPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome)*100)
    }else{
      this.percentage = -1
    }
  }
  Expense.prototype.getPercentage = function(){ 
    return this.percentage
  }
  var Income = function(id,item,value,type){
    this.id = id
    this.item = item
    this.value = value
    this.type = type
  }
  // 16 定義計算收入 支出總價的function
  var calculateTotal = function(type) {
    var sum = 0
    data.allItems[type].forEach(function(cur){
      sum+=cur.value     
    })
    data.total[type] = sum
  }
  // 08 定義物件裝所有資料 個別總額 收支 計算百分比
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }
  // 09 向controller取得輸入物件，並將其推進到陣列中
  return {
    addItem: function(type,item,val) {
      var newItem,ID
      if(data.allItems[type].length>0){
        ID = data.allItems[type][data.allItems[type].length - 1].id+1
      }else{
        ID = 0
      }
      if(type ==="exp") {
        newItem = new Expense(ID,item,val,type)
      } else if(type ==="inc") {
        newItem = new Income(ID,item,val,type)
      }
      data.allItems[type].push(newItem)
      return newItem
    },
    deleteItem: function(type,id){
      var idArray , scriptIndex
      idArray = data.allItems[type].map(function(cur){
        return cur.id
      })
      scriptIndex = idArray.indexOf(id)
      if(scriptIndex!==-1){
        data.allItems[type].splice(scriptIndex,1)
      }
    },
    //17 計算收入減支出的function 並得到百分比
    calculateBudget: function() {
      calculateTotal('exp')
      calculateTotal('inc')
      console.log(data.total.inc)
      data.budget = data.total.inc-data.total.exp
      if(data.total.inc>0){
        data.percentage = Math.round((data.total.exp / data.total.inc)*100)
      }else{
        data.percentage = -1
      }
      console.log(data.allItems)
       return{
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage 
      }
    },
    calculatePercentage: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcEveryPercentage(data.total.inc)        
      })
    },
    getPercentages: function() {
      var newArray = data.allItems.exp.map(function(cur){
        return cur.getPercentage()
      })
      return newArray
      console.log(newArray)
    }
  }
}())


var UIController = (function(){
  var formatNumber = function(num, type){
    var numSplit, int, dec, type
    num = Math.abs(num)
    num = num.toFixed(2)
    
    numSplit = num.split('.')
    int = numSplit[0]
    dec = numSplit[1]
    
    if(int.length > 3) {
      int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3)
    }
    // retuen (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
  }
  return {
    //05 定義取得input資料的function，因為要在外部使用，定義在return中
    getInput: function(){
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        item: document.querySelector(DOMstrings.inputItem).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }   
    },
    //12 建立添加項目到畫面的function（建立假html模板 取代 添加到畫面）
    addListItem: function(obj){
      var html,newHtml,element
      if(obj.type==="inc") {
        element = DOMstrings.incomeContainer
        html = '<div class="box-item box-income item" id = "inc-%id%"><div class="income-item-name">%item%</div><div class="item-value-box"><div class="income-item-value">%value%</div><div class="delete income-item-button"> <i class="fas fa-times"></i></div></div></div>'
      }else if(obj.type==="exp") {
        element = DOMstrings.expenseContainer
        html = '<div class="box-item box-expense item" id = "exp-%id%"><div class="expense-item-name">%item%</div><div class="item-value-box"><div class="expense-item-value">%value%</div><div class="percentage">22%</div><div class="delete expense-item-button"> <i class="fas fa-times"></i></div></div></div>' 
      }
      newHtml = html.replace('%id%',obj.id)
      newHtml = newHtml.replace('%value%',formatNumber(obj.value,obj.type))
      newHtml = newHtml.replace('%item%',obj.item)
      
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
      
    },
    deleteListItem: function(selectID){
      var el = document.getElementById(selectID)
      el.parentNode.removeChild(el)
    },
    //14 建立清除input function / 重新定位focus
    clearFields: function(){
      var fields , fieldsArray
      fields = document.querySelectorAll(DOMstrings.inputItem+','+DOMstrings.inputValue)
      fieldsArray = Array.prototype.slice.call(fields)
      fieldsArray.forEach(function(current){
        current.value = ""
      })
      fieldsArray[0].focus()
    },
    // 19 將淨收支加到html
    displayBudget: function(obj){
      var type
      obj.budget > 0 ? type = "inc" : type="exp"
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type)
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc')
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp') 
      if(obj.percentage>0){
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%'
      }else{
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }   
    },
    displayPercentage: function(percentage){
      var fields = document.querySelectorAll(DOMstrings.percentage)
      var nodeListForEach = function(list,callback){
        for(var i = 0 ; i<list.length ; i++){
        callback(list[i],i)
    }
  }
      
      nodeListForEach(fields,function(current,index){
        if(percentage[index]>0){
          current.textContent = percentage[index]+'%'
        }else{
          current.textContent ='---'
        }
      })
    },
    displayMonth: function(){
      var now, month, year, months
      now = new Date()
      month = now.getMonth()
      
      year = now.getFullYear()
      months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
      document.querySelector(DOMstrings.title).textContent= year+"年"+months[month]
    }
  }  
}())

var controller = (function(budgetCtrl,UICtrl){ 
  // 02 定義按鈕事件（滑鼠 鍵盤）
  var eventListener = function(){
    document.querySelector('.btn').addEventListener('click',ctrlAddItem)
    document.addEventListener('keypress',function(event){
      if(event.keyCode === 13 || event.which === 13 ) {
        ctrlAddItem()
      }
    })
    document.querySelector(DOMstrings.delete).addEventListener('click',ctrlDeleteItem)
  }
  
  var updateBudget = function(){ 
    var budget
    budget = budgetCtrl.calculateBudget()
    console.log(budget)
    UICtrl.displayBudget(budget)
    
  }
  
  var updatePercentage = function(){
    budgetCtrl.calculatePercentage()
    var percentages = budgetCtrl.getPercentages()
    console.log(percentages)
    UICtrl.displayPercentage(percentages)
  }
  // 03 新增添加項目function
  var ctrlAddItem = function(){
    console.log('bts is good!')
    var input, newItem
    // 01 下命令取得原始輸入資料（物件）/確認輸入資料格式（是否空白 錯誤）符合資格再執行 
    input = UICtrl.getInput()
    if(input.item !=="" && !isNaN(input.value) && input.value>0){
      // 02 下命令將取得的輸入資料物件傳入到budgetctrl 進行處理 回傳有id的物件
      console.log(input)
      newItem = budgetCtrl.addItem(input.type,input.item,input.value)
      console.log(newItem)
      // 03 將添加到陣列的物件裝到addlist中顯示在畫面上
      UICtrl.addListItem(newItem)
      // 04 清除輸入資料
      UICtrl.clearFields()
      // 05 計算總價 返回計算值
      updateBudget()
      updatePercentage()
      // 06 更新畫面（呼叫display連同呼叫calc 上一行可省略    
    } 
  }
  var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID
    itemID = event.target.parentNode.parentNode.parentNode.id
    
    if(itemID) {
      splitID = itemID.split('-')
      type = splitID[0]
      ID = parseInt(splitID[1])
    }
    console.log(splitID)
    budgetCtrl.deleteItem(type,ID)
    UICtrl.deleteListItem(itemID)
    updateBudget()
    updatePercentage()
  }
  return{
    init: function(){
      UICtrl.displayMonth()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1 
      })
      eventListener()
    }
  }
}(budgetController,UIController))

controller.init()