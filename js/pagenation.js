// 表格分页
/* 用法：
* 1.控制器里传入 pagenation参数
* 2. 传入要处理的表格数据 -- $scope.pageData = tableData;
* 3. 传入$scope -- pagenation.pags($scope)
* 4. ng-repeat="list in TdItem"
*/
"use strict"
angular.module("md1")
    .service("pagenation",function(){
        var self = this;
        this.pags = function(scope){
            //分页总数
            var pageSize = 5;
            var pages = Math.ceil(scope.pageData.length / pageSize); //分页数
            var newPages = pages > 10 ? 10 : pages;
            scope.pageList = [];
            var selPage = 1;
            //设置表格数据源(分页)
           self.setData = function () {
                scope.TdItem = scope.pageData.slice((pageSize * (selPage - 1)), (selPage * pageSize)); //通过当前页数筛选出表格当前显示数据
            };
            scope.TdItem = scope.pageData.slice(0, pageSize);
            //分页要repeat的数组
            for (var i = 0; i < newPages; i++) {
                scope.pageList.push(i + 1);
            }
            //打印当前选中页索引
            scope.selectPage = function(page) {
                //不能小于1大于最大
                if (page < 1 || page > pages) return;
                //最多显示分页数5
                if (page > 2) {
                    //因为只显示5个页数，大于2页开始分页转换
                    var newpageList = [];
                    for (var i = (page - 3); i < ((page + 2) > pages ? pages : (page + 2)); i++) {
                        newpageList.push(i + 1);
                    }
                    scope.pageList = newpageList;
                }
            selPage = page;
            self.setData();
            scope.isActivePage(page);
            };
            //设置当前选中页样式
            scope.isActivePage = function(page) {
                return selPage == page;
            };
            //上一页
            scope.Previous = function() {
                scope.selectPage(selPage - 1);
            };
            //下一页
            scope.Next = function() {
                scope.selectPage(selPage + 1);
            };

        }
    })