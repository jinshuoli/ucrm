/********************侧边栏折叠图标**********************/
$(function() {
    $(".panel-heading").click(function(e) {
        /*切换折叠指示图标*/
        $(this).find("span").toggleClass("glyphicon glyphicon-chevron-up");
        $(this).find("span").toggleClass("glyphicon glyphicon-chevron-down");
    });
    $(".list-group-item").hover(
        function() {
            $(this).find("span").animate({ left: '1px', opacity: '1' });
        },
        function() {
            $(this).find("span").stop(5)
                .animate({ left: '-28px', opacity: '0.1' });
        }
    );
});
/********************scrollBy慢速滚动返回顶部**********************/
var dstId, selectedpid, sdelay = 0;

function returnTop() {
    window.scrollBy(0, -100); //Only for y vertical-axis
    if (document.body.scrollTop > 0) {
        sdelay = setTimeout(returnTop, 80)
    }
}
//日期格式化
Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
/****************************************** angularjs *******************************************/
angular.module('md1', ['ng', 'ngRoute', 'ngAnimate', 'ngTouch', 'angularFileUpload'])
    .controller('service', ['$scope', '$http',function($scope, $http) {}])
    /********************个人信息**********************/
    .controller('userInfo',['$scope', '$http', function($scope, $http) {
        // 获取个人信息
        $scope.userInfo = {name:"小明",code:6060,email:"8080@.hotmail.cn",address:"北京",tel:132}
        $http.get('url.action').success(function(data, status, headers, congfig) {

            $scope.userInfo = JSON.parse(data);
            // 修改
            $scope.modifyTel =function (telInfo){
                 $scope.telInfoIn = telInfo;
                 $scope.TelHide = true
            }
            // 确认修改
            $scope.ConfirmModify =function (telInfoIn) {
            // 发送修改的电话号码
                 $http.post('url.action?telInfoIn:'+ telInfoIn )
                 .success(function() {
                    $scope.TelHide = !$scope.TelHide;
                    window.location.href='index.html#/userInfo';
                 })
                 .error(function(data, status, headers, config) {alert("修改失败");});
            }
            // 取消
             $scope.CancelModify =function (){
                 $scope.TelHide = false
            }
        }).error(function(data, status, headers, config) {alert("获取个人信息失败");});
    }])
    /********************客户管理**********************/
    .controller("customer", ['$scope', '$http', '$upload', function($scope, $http, $upload,pagenation) {
        //添加(文件上传)
        var file;
        $scope.onFileSelect = function($files) {
            file = $files;
        };
        init();
        $scope.customerTdadd = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'customer_add.action',
                method: 'POST',
                data: JSON.stringify($scope.customerForm),
                file: file,
            }).success(function(data, header, config, status) {
                init();
                console.log(JSON.stringify($scope.customerForm));
                $scope.upload = $upload.upload({
                    url: 'customer_loadImg.action',
                    data: { "custName": $scope.customerForm.name, "imageFileName": file[0].name },
                    //withCredentials: true,
                    file: file,
                    transformRequest: angular.identity
                }).progress(function(evt) {
                    //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
                    init();
                    console.log(file[0].name);
                    // console.log($scope.customerForm.name);
                    $scope.customerForm = '';
                    console.log(data);
                });
                alert("响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        $http.get('service_getServiceList.action').success(function(data, status, headers, congfig) {
            $scope.serviceId = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //-----------------------客户列表查询------------------------------
        function init() {
            $http.get('customer_queryCustList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };
        //删除
        $scope.deleteTd = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'customer_delete.action?custId=' + i,
                //                data:JSON.parse(i),
                //                dataType:"json",
            }).success(function(data, status, config, header) {
                init();
                console.log("发送的东西-----------------" + JSON.stringify(i));
                alert(data);
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //搜索
        $scope.search = function() {
            $http.get('customer_queryCustList.action?custName=' + $scope.searchList.custName + '&custType=' + $scope.searchList.custType + '&createTime=' + $scope.searchList.createTime).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.searchList.number);
        };

        //-----------------------修改客户-----------------------------
        //点击修改Td默认的值
        $scope.updateTd = function(i) {
            $scope.customerForm             = {};
            $scope.customerForm.name        = $scope.customerTD[i].name;
            $scope.customerForm.code        = $scope.customerTD[i].code;
            $scope.customerForm.type        = $scope.customerTD[i].type;
            $scope.customerForm.appkey      = $scope.customerTD[i].appkey;
            $scope.customerForm.address     = $scope.customerTD[i].address;
            $scope.customerForm.phone       = $scope.customerTD[i].phone;
            $scope.customerForm.linkman     = $scope.customerTD[i].linkman;
            $scope.customerForm.email       = $scope.customerTD[i].email;
            $scope.customerForm.custId      = $scope.customerTD[i].custId
            $scope.customerForm.setSubsMode = $scope.customerTD[i].setSubsMode;
        };
        $scope.customerUpdate = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'customer_update.action',
                data: JSON.stringify($scope.customerForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                init();
                console.log("发送的东西-----------------" + JSON.stringify($scope.customerForm));
                alert("更新成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
            console.log($scope.functionSys_roleForm);
        };
    }])
    /********************账户管理**********************/
    .controller('account', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        //-----------------------账户列表查询------------------------------
        selectaccount();

        function selectaccount() {
            $http.get('account_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };

        //添加
        $scope.AddAcctForm = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'account_add.action',
                data: JSON.stringify($scope.accdata),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectaccount();
                $scope.accdata = ''; //传完值后清空表单
            }).error(function(data, status, hedaer, config) {
                alert("添加失败");
            });
        };
        //下拉框查询（添加,修改）
        //        $scope.selectC = function(){
        $http.get('account_getAccountList.action').success(function(data, status, headers, congfig) {
            $scope.name = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, config) {
            alert("获取失败");
        });
        //查询的值放到这里
        //搜索
        $scope.search = function() {
            $http.get('account_queryList.action?accName=' + $scope.searchForm.accName + '&accStatus=' + $scope.searchForm.accStatus + '&acctCode=' + $scope.searchForm.acctCode).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.searchForm); //要向后台传的数据(搜素)
        };
        //删除
        $scope.accdelete = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'account_delete.action?acctId=' + i,
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectaccount();
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        //修改
        $scope.Revise = function(i) {
            //下拉框查询（添加,修改）
            $http.get('account_findById.action?custId=' + $scope.accdataTd[i].custId).success(function(data, status, headers, congfig) {
                $scope.custId = JSON.parse(data);
            }).error(function(data, status, headers, congfig) {
                alert("获取失败");
            });
            $scope.accRevise              = {};
            $scope.accRevise.name         = $scope.accdataTd[i].accName;
            $scope.accRevise.acctId       = $scope.accdataTd[i].acctId;
            $scope.accRevise.custId       = $scope.accdataTd[i].custId;
            $scope.accRevise.acctCode     = $scope.accdataTd[i].acctCode;
            $scope.accRevise.type         = $scope.accdataTd[i].accType;
            $scope.accRevise.status       = $scope.accdataTd[i].accStatus;
            $scope.accRevise.payMethod    = $scope.accdataTd[i].accPayMethod;
            $scope.accRevise.comments     = $scope.accdataTd[i].accComments;
            $scope.accRevise.createUser   = $scope.accdataTd[i].suName;
            $scope.accRevise.accCreatUser = $scope.accdataTd[i].accCreatUser;
        };
        //显示详细信息
        $(function() {
            $scope.info = function(k) {
                $("#infomodal").modal("toggle"); //控制显示弹框
                $(".modal-backdrop").remove(); //删除class值为modal-backdrop的标签，可去除阴影
                $http.get('member_findCustomerById.action?custId=' + $scope.accdataTd[k].custId).success(function(data, status, headers, congfig) {
                    $scope.accName = $scope.accdataTd[k].accName;
                    $scope.accdataInfoTd = JSON.parse(data);
                    console.log(k);
                }).error(function(data, status, headers, congfig) {
                    alert("获取失败");
                });
            };
        });
        //用户修改后的数据
        $scope.accReviseForm = function() {
            k = $("#sel").val();
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'account_update.action',
                data: JSON.stringify($scope.accRevise),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectaccount();
            }).error(function(data, status, hedaer, config) {
                alert("更新失败");
            });
            console.log($scope.accRevise);
        };
    }])
    /********************余额查询**********************/
    .controller('BalanceInquiry',['$scope', '$http', function($scope, $http) {
        // 获取账户余额和账户级别
        $http.get('url.action').then(function(response) {
              $scope.Balance = JSON.parse(response.Balance)
              $scope.Level = JSON.parse(response.Level)
            });
        // 默认选中
        $scope.num = "800"
        // 余额预警
        $scope.BalanceWarning= function(num){
           $http.post('url.action').then(function(num) {

            });
        }
    }])
    /********************成员管理**********************/
    .controller('member', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        init();
        //----------------------成员列表查询------------------------------
        function init() {
            $http.get('member_queryMemberList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        //添加
        $scope.AddMemberForm = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'member_add.action',
                data: JSON.stringify($scope.memberAddForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                console.log("发送的东西-----------------" + JSON.stringify($scope.memberAddForm));
                $scope.memberAddForm = ''; //传完值后清空表单
                init();
                alert("添加成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //下拉框查询（添加,修改）
        //        $scope.selectC = function(){
        $http.get('account_getAccountList.action').success(function(data, status, headers, congfig) {
            $scope.name = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //查询的值放到这里
        //搜索
        $scope.search = function() {
            $http.get('member_queryMemberList.action?name=' + $scope.searchForm.name + '&prtms=' + $scope.searchForm.prtms + '&acms=' + $scope.searchForm.acms).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.searchForm); //要向后台传的数据(搜素)
        };
        //删除
        $scope.getSecretNo = function() {
            $http.get('member_getSecretNo.action').then(function(response) {
                //            alert("你要获取的隐私号是"+response.data);
                if (response.data != null) {
                    $("input[name='acms']").val(response.data);
                    $scope.memberAddForm.acms = response.data;
                } else {
                    $scope.memberAddForm.acms = "";
                    alert("没有空闲的隐私号");
                }
            });
            //要向后台传的数据(删除)——查询到才有
        };
        $scope.memberDelete = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'member_delete.action?memberId=' + i,
                //                data:JSON.parse(i),
                //                dataType:"json",
            }).success(function(data, status, config, header) {
                console.log("发送的东西-----------------" + JSON.stringify(i));
                init();
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //修改
        $scope.Revise = function(i) {
            //下拉框查询（添加,修改）
            $http.get('account_findById.action?custId=' + $scope.memberTd[i].custId).success(function(data, status, headers, congfig) {
                $scope.custName = JSON.parse(data);
                console.log($scope.custName);
            }).error(function(data, status, headers, congfig) {
                alert("获取失败");
            });
            $scope.memberUpdateForm            = {};
            $scope.memberUpdateForm.name       = $scope.memberTd[i].name;
            $scope.memberUpdateForm.prtms      = $scope.memberTd[i].prtms;
            $scope.memberUpdateForm.certType   = $scope.memberTd[i].certType;
            $scope.memberUpdateForm.certNumber = $scope.memberTd[i].certNumber;
            $scope.memberUpdateForm.acms       = $scope.memberTd[i].acms;
            $scope.memberUpdateForm.email      = $scope.memberTd[i].email;
            $scope.memberUpdateForm.custId     = $scope.memberTd[i].custId;
            $scope.memberUpdateForm.appPwd     = $scope.memberTd[i].appPwd;
            $scope.memberUpdateForm.memberId   = $scope.memberTd[i].memberId;
        };
        //显示详细信息
        $(function() {
            $scope.info = function(k, i) {
                $("#infomodal").modal("toggle"); //控制显示弹框
                $(".modal-backdrop").remove(); //删除class值为modal-backdrop的标签，可去除阴影
                //                $scope.memberInfoTd={};//表格详细信息数据放这里
                $http.get('member_findCustomerById.action?custId=' + i).success(function(data, status, headers, congfig) {
                    $scope.MemberName = $scope.memberTd[k].name;
                    $scope.memberInfoTd = JSON.parse(data);
                    console.log($scope.memberTd[k].name);
                }).error(function(data, status, headers, congfig) {
                    alert("获取失败");
                });
            };
        });
        //用户修改后的数据
        $scope.memberUpdate = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'member_update.action',
                data: JSON.stringify($scope.memberUpdateForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                console.log("发送的东西-----------------" + JSON.stringify($scope.memberUpdateForm));
                init();
                // alert("更新成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
    }])
    /********************认证信息**********************/
    .controller('Authentication', ['$scope', '$http', 'pagenation','$upload',function($scope, $http, $upload) {
        $scope.AuthenticationForm = {}
        // 三证合一(一照一码)默认选中
        $scope.AuthenticationForm.DocumentType = "ThreeInOneTiops";
        $scope.AuthenticationForm.developer = "enterprise";
        $(".Authentication input[type='radio']").on('click',function(){
            $scope.AuthenticationForm = {}  // 每次点击radio按钮，清空AuthenticationForm
            $scope.AuthenticationForm.DocumentType = "ThreeInOneTiops";
        })
        // 向后台发送表单数据
        $scope.AddDeveloperForm = function(){
            console.log($scope.AuthenticationForm)
            $http({
                // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'url',
                method: 'POST',
                data: JSON.stringify($scope.AuthenticationForm),
                dataType: "json",
            }).success(function(data, header, config, status) {

            }).error(function(data, header, config, status) {
                alert("认证失败");
            });
        }
        // 上传证件(身份证，护照)
        $scope.postPhoto = function($files) {
            console.log($files[0].name)
            $scope.upload = $upload.upload({
                url: '路径',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("证件上传成功！");
            }).error(function(data, status, hedaer, config) {
                alert("证件上传失败！");
            });
        };
        // 上传 营业执照   三证合一(一照一码)
        $scope.postBLicense = function($files) {
            console.log($files)
            $scope.upload = $upload.upload({
                url: '路径',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("证件上传成功！");
            }).error(function(data, status, hedaer, config) {
                alert("证件上传失败！");
            });
        };
        // 上传 营业执照   三证合一
        $scope.postBLicense2 = function($files) {
            console.log($files[0].name)
            $scope.upload = $upload.upload({
                url: '路径',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("证件上传成功！");
            }).error(function(data, status, hedaer, config) {
                alert("证件上传失败！");
            });
        };
        // 上传 税务登记证   三证分离
        $scope.postTaxRegCard = function($files) {
            console.log($files[0].name)
            $scope.upload = $upload.upload({
                url: '路径',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("证件上传成功！");
            }).error(function(data, status, hedaer, config) {
                alert("证件上传失败！");
            });
        };
        // 上传 营业执照      三证分离
        $scope.postBLicense3 = function($files) {
            console.log($files[0].name)
            $scope.upload = $upload.upload({
                url: '路径',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("证件上传成功！");
            }).error(function(data, status, hedaer, config) {
                alert("证件上传失败！");
            });
        };
    }])
    /********************小号资源**********************/
    .controller('secret', ['$scope', '$http', '$upload', '$window', 'pagenation',function($scope, $http, $upload, $window,pagenation) {
        selectnumber();
        //下拉框查询（添加,修改）
        $http.get('secretNo_getSecretNoListList.action').success(function(data, status, headers, congfig) {
            $scope.name = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //查询
        function selectnumber() {
            $http.get('secretNo_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        //添加
        $scope.secretAddForm = {};
        $scope.secretAddFormOk = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'secretNo_add.action',
                data: JSON.stringify($scope.secretAddForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectnumber();
                $scope.secretAddForm = ''; //传完值后清空表单
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //下拉框查询
        $scope.query = function() {
            $scope.username = {}; //查询到的值等给这个变量
        };
        //搜索
        $scope.secretSearch = function() {
            $http.get('secretNo_queryList.action?number=' + $scope.secretSearchForm.number + '&type=' + $scope.secretSearchForm.type + '&status=' + $scope.secretSearchForm.status).then(function(response) {
                // $scope.data = JSON.parse(response.data);
               $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };
        //删除
        $scope.deleteTd = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'secretNo_delete.action?numberId=' + i,
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectnumber();
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        //修改
        $scope.reviseTd = function(i) {
            $http.get('secretNo_findById.action?userId=' + $scope.secretTD[i].createUser).success(function(data, status, headers, congfig) {
                $scope.name = JSON.parse(data);
                console.log($scope.name);
            }).error(function(data, status, headers, congfig) {
                alert("获取失败");
            });
            $scope.secretReviseForm            = {};
            $scope.secretReviseForm.numberId   = $scope.secretTD[i].numberId;
            $scope.secretReviseForm.createUser = $scope.secretTD[i].createUser;
            $scope.secretReviseForm.number     = $scope.secretTD[i].number;
            $scope.secretReviseForm.appkey     = $scope.secretTD[i].appkey;
            $scope.secretReviseForm.type       = $scope.secretTD[i].type;
            $scope.secretReviseForm.batchNo    = $scope.secretTD[i].batchNo;
            $scope.secretReviseForm.state      = $scope.secretTD[i].state;
            $scope.secretReviseForm.stateDate  = $scope.secretTD[i].stateDate;
            $scope.secretReviseForm.createDate = $scope.secretTD[i].createDate;
            $scope.secretReviseForm.city       = $scope.secretTD[i].city;
            $scope.secretReviseForm.areaCode   = $scope.secretTD[i].areaCode;
            $scope.secretReviseForm.iccid      = $scope.secretTD[i].iccid;
            $scope.secretReviseForm.imsi       = $scope.secretTD[i].imsi;
        };
        //点击确定修改 将用户修改的数据传给后台
        $scope.secretReviseFormOk = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'secretNo_update.action',
                data: JSON.stringify($scope.secretReviseForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                selectnumber();
            }).error(function(data, status, hedaer, config) {
                alert("修改失败");
            });
            console.log($scope.secretReviseFormOk);
        };
        //显示详细信息
        $(function() {
            $scope.info = function(i) {
                $("#infomodal").modal("toggle"); //控制显示弹框
                $(".modal-backdrop").remove(); //删除class值为modal-backdrop的标签，可去除阴影
                $http.get('secretNo_findSysUserById.action?userId=' + $scope.secretTD[i].createUser).success(function(data, status, headers, congfig) {
                    $scope.name = $scope.secretTD[i].name;
                    $scope.secretdataInfoTd = JSON.parse(data);
                    console.log(i);
                }).error(function(data, status, headers, congfig) {
                    alert("获取失败");
                });
            };
        });
        //下载模板
        $scope.Download = function() {
            $window.open('number.xlsx');
        };
        //弹出文件上传的框
        $(function() {
            $scope.fail = function() {
                $("#failmodal").modal("toggle"); //控制显示弹框
            };
        });
        //上传
        $scope.onFileSelect = function($files) {
            //          var file = $files;
            $scope.upload = $upload.upload({
                url: 'secretNo_importExcel.action',
                data: { "excel": $files[0].name },
                file: $files,
            }).progress(function(evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                selectnumber();
                alert("上传成功");
                $("#failmodal").modal("hide"); //关闭
            }).error(function(data, status, hedaer, config) {
                alert("上传失败");
            });
        };
    }])
    /********************资费计划**********************/
    .controller('priceplan',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        $scope.pricePlanForm = {};
        $scope.postageTd = {};
        pricePlanInit();

        function pricePlanInit() {
            $http.get('pricePlanConfig_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        } //在下拉框内循环输出下面的内容

        $http.get('service_getServiceList.action').success(function(data, status, headers, congfig) {
            $scope.serviceId = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //-----------------------分页结束------------------------------
        //表格末尾添加
        $scope.priceplanTdadd = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'pricePlanConfig_add.action',
                method: 'POST',
                data: JSON.stringify($scope.pricePlanForm),
            }).success(function(data, header, config, status) {
                console.log(JSON.stringify($scope.pricePlanForm));
                pricePlanInit();
                alert("添加成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //删除行
        $scope.deletePostage = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'pricePlanConfig_delete.action?pricePlanId=' + i,
                // data:JSON.parse(i),
                // dataType:"json",
            }).success(function(data, status, config, header) {
                console.log("发送的东西-----------------" + JSON.stringify(i));
                pricePlanInit();
                alert("删除成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //搜索
        $scope.search = function() {
            $http.get('pricePlanConfig_queryList.action?pricePlanName=' + $scope.searchList.pname + '&serviceId=' + $scope.searchList.ptype).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.searchList.number);
        };
        //在Td内循环添加下面的内容
        $scope.priceplanTD = [];
        $scope.PackageTD = [];
        //-----------------------属性设置------------------------------
        var postageId, PackageId, modalPackage, updatePackageId, modalRevisePackage;
        //
        $scope.attrChange = function(m) {
            modalPackage = m;
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_selectAttr.action?attrId=' + m,
                method: 'GET',
            }).success(function(data, header, config, status) {
                $scope.attrValueTD = data;
                console.log(data);
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //资费添加属性
        $scope.propertyAdd = function() {
            var propIds = [];
            console.log(postageId); //第一个表格的ID，点击添加后传给后台的；
            for (i = 0; i < $scope.PackageTD.length; i++) {
                propIds.push($scope.PackageTD[i].propId);
            }
            console.log(propIds);
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_init.action?propIds=' + propIds,
                method: 'GET',
            }).success(function(data, header, config, status) {
                console.log(data);
                $scope.priceplanSelect = JSON.parse(data);
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //点击资费的修改
        $scope.RevisePostage = function(i) {
            $scope.priRevPosForm = {};
            $scope.priRevPosForm.name = $scope.postageTd[i].name;
            $scope.priRevPosForm.code = $scope.postageTd[i].code;
            $scope.priRevPosForm.des = $scope.postageTd[i].des;
            $scope.priRevPosForm.serviceId = $("#service").find("option:selected").val();
            $("#service").val($scope.postageTd[i].serviceId);
            alert($scope.postageTd[i].serviceId)
            if ($scope.postageTd[i].effDate != null) {
                effDate = new Date($scope.postageTd[i].effDate.time).Format("yyyy-MM-dd hh:mm:ss");
                $scope.priRevPosForm.effDate = effDate;
            }
            if ($scope.postageTd[i].expDate != null) {
                expDate = new Date($scope.postageTd[i].expDate.time).Format("yyyy-MM-dd hh:mm:ss");
                $scope.priRevPosForm.expDate = expDate;
            }
            $scope.priRevPosForm.priceplanId = $scope.postageTd[i].priceplanId;
        };
        //点击资费修改的确认
        $scope.priceplanTdOK = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'pricePlanConfig_update.action',
                data: JSON.stringify($scope.priRevPosForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                console.log("发送的东西-----------------" + JSON.stringify($scope.priRevPosForm));
                pricePlanInit();
                alert("更新成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
            console.log($scope.priRevPosForm);
            //$scope.priRevPosForm 这是用户修改后的值
        };
        //点击资费属性修改
        $scope.RevisePackage = function(i, j, k) {
            //j这是ValueId
            //k这是ValueMark
            updatePackageId = j;
            $scope.PackageReviseForm = [];
            $scope.PackageReviseForm.attrname = k;
            //            $scope.RevisePackageTD//将表格的数据赋给这个值
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_update.action?propId=' + j,
            }).success(function(data, status, config, header) {
                $scope.RevisePackageTD = JSON.parse(data);
                alert("更新成功");
                console.log("发送的东西-----------------" + JSON.stringify(j));
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        $scope.RevisePackageChange = function(m) {
            $scope.yesno2 = true;
            modalRevisePackage = m;
        }; //点击input获取的ID赋给全局变量
        //点击套餐修改确认
        $scope.RevisePackageID = function() {
            //            modalRevisePackage//这是用户点击修改套餐的按钮ID
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_updateOkPress.action?propValueId=' + modalRevisePackage.attrValueId + "&pricePlanId=" + postageId + "&propId=" + updatePackageId,
            }).success(function(data, status, config, header) {
                queryAttr(postageId);
                console.log("发送的东西-----------------" + JSON.stringify(j));
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //-----------------------资费计划单选点击------------------------------
        $scope.withinPackage = function(j) {
            $scope.attr = true;
            PackageId = j;
        }; //点击input获取的ID赋给全局变量
        //-----------------------保存资费属性------------------------------
        //点击模态框的确认 传下拉框和表格的ID
        $scope.okPress = function() {
            console.log("下拉框ID：————" + modalPackage);
            console.log("表格radio ID：————" + PackageId);
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_okPress.action?pricePlanId=' + postageId + "&attrId=" + modalPackage + "&attrvalueId=" + PackageId,
                method: 'GET',
            }).success(function(data, header, config, status) {
                console.log(data);
                queryAttr(postageId);
                $scope.attrValueTD = "";
                console.log($scope.PackageTD);
                // $scope.PackageTD=data
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
            // $scope.PackageTD.push($scope.priceplanForm);
        };
        $scope.deleteAttrId = function(i, j) {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_delete.action?attrId=' + i + "&pricePlanId=" + postageId + "&attrValueId=" + j,
                method: 'GET',
            }).success(function(data, header, config, status) {
                queryAttr(postageId);
                alert("删除成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };

        function queryAttr(i) {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'property_query.action?pricePlanId=' + i,
                method: 'GET',
            }).success(function(data, header, config, status) {
                $scope.PackageTD = data;
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        }
        $scope.withinPostage = function(i) {
            $scope.yesno = true;
            postageId = i;
            queryAttr(i);
        };
    }])
    /********************客户资费**********************/
    .controller('custproduct',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        $scope.productForm = [];
        //获取service服务
        $http.get('service_getServiceList.action').success(function(data, status, headers, congfig) {
            $scope.RelaSelect = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //查询
        custProductInit();

        function custProductInit() {
            $http.get('custPricePlanConfig_query.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
               $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
                querySelectedPricePlan(0);
            });
        }
        //条件查询
        $scope.productSearch = function() {
            $http.get('custPricePlanConfig_query.action?custName=' + $scope.SearchForm.name + "&custType=" + $scope.SearchForm.type).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
                querySelectedPricePlan(0);
            });
        }
        // 获取客户套餐资费，如果已添加则显示
        function querySelectedPricePlan(i) {
            $scope.changePricePlanCust = $scope.custProductTD[i].name
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'custPricePlanConfig_querySelectedPricePlan.action?pricePlanId=' + $scope.custProductTD[i].pricePlanId + "&custId=" + $scope.custProductTD[i].custId,
                method: 'GET',
            }).success(function(data, header, config, status) {
                $scope.product_relaTD = JSON.parse(data);

            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        }
        $scope.withinProduct = function(j) {
            productid = j
            querySelectedPricePlan(productid);
        }
        var product_relaid, productid, RelaSelect, srcPricePlanId, dstCustId, selectedPid;
        $(function() {
            $scope.productTDChange = function(i, m) {
                //默认选中
                //$("#RelaSelect").val(i+1)
                selectedPid = i
                $scope.changePricePlanCust = $scope.custProductTD[m].cName
                srcPricePlanId = $scope.custProductTD[m].pricePlanId
                dstCustId = $scope.custProductTD[m].custId
                $http({
                    url: 'custPricePlanConfig_querySelectablePricePlan.action?selectedPid=' + selectedPid + "&custId=" + dstCustId,
                    method: 'GET',
                }).then(function(response) {
                    //分页总数
                    console.log(angular.equals(response.data, ""))
                    if (angular.equals(response.data, "")) {
                        //            $('#myModal').modal('hide')
                        //            $(".modal-backdrop").remove();
                        //            alert("请为该客户先添加一个账户！");
                        $scope.notes = true
                        $scope.des = "请为该客户先添加一个账户！"
                    } else {
                        $scope.notes = false
                        $scope.des = ""
                       $scope.pageData = JSON.parse(response.data);
                        pagenation.pags($scope)
                    }
                })
            }
        })
        $scope.withinProduct_rela = function(k) {
                $scope.yesno = true;
                product_relaid = k
            }
        // 点击确认换套餐
        $scope.product_relaChangeOk = function() {
                alert("这是input的id：" + product_relaid)
                alert("这是下拉框的ID:" + RelaSelect)
                $http({
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    url: 'custPricePlanConfig_changePricePlan.action?dstPricePlanId=' + product_relaid + "&custId=" + dstCustId + "&srcPricePlanId=" + srcPricePlanId,
                    method: 'GET',
                }).success(function(data, header, config, status) {
                    alert("响应成功");
                    //                  $scope.product_relaTD=JSON.parse(data);
                    //                                         $scope.PackageTD=data;
                }).error(function(data, header, config, status) {
                    alert("处理响应失败");
                });
            }
        // 查询资费套餐
        $scope.product_relaSearch = function() {
            $http.get('custPricePlanConfig_querySelectablePricePlan.action?selectedPid=' + selectedPid + "&custId=" + dstCustId + "&pricePlanName=" + $scope.RelaSearchForm.pricePlanName + "&serviceId=" + $scope.RelaSearchForm.serviceId).then(function(response) {
                $scope.datas = JSON.parse(response.data);
                pricePlanPagenation();
            });
        }
    }])
    /********************成员资费**********************/
    .controller('memberProduct', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        //获取service服务
        $http.get('service_getServiceList.action').success(function(data, status, headers, congfig) {
            $scope.ServiceSelect = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //查询成员全列表
        memberProductInit();

        function memberProductInit() {
            $http.get('memPricePlanConfig_query.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
              $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        var Single, MMSelect, double = [];
        $scope.withinMember = function(k) {
            double.push(k)
        }
        $scope.withinNmember = function(i) { Single = i }
            //添加
        $scope.memberAdd = function() {
                console.log(double) //用户要添加项的ID
                $("#MMSelectid").val(1)
            }
            //确认添加
        $scope.memberAddOk = function() {
                alert(Single)
            }
            //搜索
        $scope.memberSearch = function() {
                $scope.memberSearchForm = {}
            }
            //搜索的下拉框
        $http.get('account_getAccountList.action').success(function(data, status, headers, congfig) {
            $scope.MemberSelect = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //显示详细信息
        $(function() {
            $scope.info = function(k, i) {
                $("#infomodal").modal("toggle"); //控制显示弹框
                $(".modal-backdrop").remove(); //删除class值为modal-backdrop的标签，可去除阴影
                $scope.pricePlanInfoTd = {}; //表格详细信息数据放这里
                $http.get('memPricePlanConfig_querySelectedPricePlan.action?pricePlanId=' + i + "&acms=" + $scope.memProductTD[k].acms).success(function(data, status, headers, congfig) {
                    $scope.memName = $scope.memProductTD[k].memberName;
                    $scope.pricePlanInfoTd = JSON.parse(data);
                }).error(function(data, status, headers, congfig) {
                    alert("获取失败");
                });
            };
        });
        //模态框的下拉框
        $scope.MMSelectID = [
            { 0: "lte", 1: "ussd", 2: "sms", 3: "decs" }
        ]
        $scope.MAvtic = function(l) { //变换下拉框的值
                MMSelect = l
            }
            //模态框搜索
        $scope.MemberSearch = function() {
            $scope.MMSearchForm = {};
        };
    }])
    /********************功能管理**********************/
    .controller('Administration', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        $scope.AdministrationForm = {};
        init();
        //添加行
        $http.get('sysFunction_getParentFunctionList.action').success(function(data, status, headers, congfig) {
            $scope.parentId = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        //        $scope.AdministrationForm.status =  $scope.status[0]; //select下拉框默认内容
        $scope.AdministrationTdadd = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysFunction_add.action',
                method: 'POST',
                data: JSON.stringify($scope.AdministrationForm),
                dataType: "json",
            }).success(function(data, header, config, status) {
                alert("响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //删除行
        $scope.deleteTd = function(i) {
            $scope.AdministrationTD.splice(i, 1);
        };

        function init() {
            //获取数据
            //        $http.get('sysFunction_queryList.action?page='+1+'&pageSize='+5 ).success(function(data,status,headers,congfig){
            $http.get('sysFunction_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        //搜索
        $scope.search = function() {
            $http.get('sysFunction_queryList.action?functionName=' + $scope.searchList.name + '&functionCode=' + $scope.searchList.number).success(function(response){
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)

            })
        };
        //删除
        $scope.deleteTd = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysFunction_delete.action?id=' + i,
            }).success(function(data, status, config, header) {
                init();
                console.log("发送的东西-----------------" + JSON.stringify(i));
                alert(i);
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        $scope.levelId = [{ "1": "第一等级", "2": "第二等级" }];
        //-----------------------修改客户-----------------------------
        //点击修改Td默认的值
        $scope.updateTd = function(i, k) {
            $scope.AdministrationForm = {};
            $("#parent").val($scope.AdministrationTD[i].parentFunctionId)
            $scope.AdministrationForm.functionName = $scope.AdministrationTD[i].functionName;
            $scope.AdministrationForm.target = $scope.AdministrationTD[i].target;
            $scope.AdministrationForm.functionCode = $scope.AdministrationTD[i].functionCode;
            $scope.AdministrationForm.functionId = $scope.AdministrationTD[i].functionId;
            $scope.AdministrationForm.parentFunctionId = $("#parent").find("option:selected").val();
            $scope.AdministrationForm.levelId = $("#levelId").find("option:selected").val();
            //          alert($scope.AdministrationTD[i].parentFunctionId)
            $("#level").val(k)
        };
        $scope.sysFunctionUpdate = function() {
            $scope.AdministrationForm.parentId = $("#parent").find("option:selected").val()
            $scope.AdministrationForm.levelId = $("#level").find("option:selected").val()
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysFunction_update.action',
                data: JSON.stringify($scope.AdministrationForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                init();
                console.log("发送的东西-----------------" + JSON.stringify($scope.AdministrationForm) + { "parentId": parent, "levelId": level });
                alert("更新成功");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
            console.log($scope.functionSys_roleForm);
        };
        function queryUsedFunction() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRoleFunction_queryList.action?roleId=' + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                ctrl.usedFunc = JSON.parse(data);
                console.log(data);
                //                   $scope.PackageTD=data
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        }

        function queryNoUseFunction() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRoleFunction_queryNoUseFuncList.action?roleId=' + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                ctrl.noUseFunc = JSON.parse(data);
                //  console.log(data);
                //  $scope.PackageTD=data
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        }
        var k;
        //——功能管理▷▷→权限管理
        var ctrl = this;
        //查询
        $scope.functionAuth = function() {
            $http.get('sysRole_getRoleList.action').success(function(data, status, headers, congfig) {
                $scope.roleId = JSON.parse(data);
                //                 console.log(data);
            }).error(function(data, status, headers, congfig) {
                alert("获取失败");
            });
            $("#sel").change(function() {
                k = $("#sel").find("option:selected").val();
                //k这是下拉框的key值
                queryUsedFunction();
                queryNoUseFunction();
            })
        };
        ctrl.funcChange = function(values) { console.log(values); }; //点击转换按钮添加的值
        //点击保存要给后台的值
        $scope.Preservation = function() {
            // console.log(ctrl.usedFunc)//左边的值
            // console.log(ctrl.noUseFunc); //右边的值
            var functionIds = [];
            for (var i = 0; i < ctrl.usedFunc.length; i++) {
                functionIds.push(ctrl.usedFunc[i].id);
            }
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRoleFunction_saveRoleFunctions.action?functionIds=' + functionIds + "&roleId=" + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                ctrl.noUseFunc = JSON.parse(data);
                alert("处理响应成功");
                // console.log(data);
                // $scope.PackageTD=data
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
            console.log(functionIds);
        };
    }])
    /*******************角色管理**************************/
    .controller('role', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        selectrole();
        //查询
        //获取数据
        function selectrole() {
            $http.get('sysRole_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                  $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };
        //下拉框内容
        $scope.status = { V: "有效", I: "无效", T: "过期" };
        $scope.functionSys_addForm = {};
        //添加
        $scope.functionSys_roleTdadd = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRole_add.action',
                data: JSON.stringify($scope.functionSys_addForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                selectrole();
                console.log("发送的东西-----------------" + JSON.stringify($scope.functionSys_addForm));
                $("#myModal").modal("hide");
            }).error(function(data, status, hedaer, config) {
                alert("添加成功");
            });
        };
        //删除
        $scope.deleteTd = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRole_delete.action?roleId=' + i,
                //                data:JSON.parse(i),
                //                dataType:"json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                selectrole();
                console.log("发送的东西-----------------" + JSON.stringify(i));
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        //条件搜索
        $scope.search = function() {
            $http.get('sysRole_queryList.action?roleName=' + $scope.searchList.roleName + '&status=' + $scope.searchList.status).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                  $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            // console.log($scope.searchList.roleName);
        };
        //点击修改Td默认的值
        $scope.reviseTd = function(i) {
            $scope.functionSys_roleForm = {};
            $scope.functionSys_roleForm.roleName = $scope.functionSys_roleTd[i].roleName;
            $scope.functionSys_roleForm.status = $scope.functionSys_roleTd[i].status;
            $scope.functionSys_roleForm.commit = $scope.functionSys_roleTd[i].commit;
            $scope.functionSys_roleForm.roleId = $scope.functionSys_roleTd[i].roleId;
        };
        //向后台传的 修改的值
        $scope.functionSys_revise = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysRole_update.action',
                data: JSON.stringify($scope.functionSys_roleForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                selectrole();
            }).error(function(data, status, hedaer, config) {
                alert("修改失败");
            });
            console.log($scope.functionSys_roleForm);
        };
    }])
    /*******************操作员管理********************/
    .controller('Operator',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        selectuser();
        //下拉框查询（添加,修改）
        $http.get('sysUser_getSysUserList.action').success(function(data, status, headers, congfig) {
            $scope.orgName = JSON.parse(data);
            console.log(data);
        }).error(function(data, status, headers, congfig) {
            alert("获取失败");
        });
        // 查询
        function selectuser() {
            $http.get('sysUser_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        //添加
        $scope.userdata = {};
        $scope.submitForm = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUser_add.action',
                data: JSON.stringify($scope.userdata),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectuser();
                console.log("发送的东西-----------------" + JSON.stringify($scope.userdata));
                $scope.userdata = ''; //传完值后清空表单
                $("#submitForm").modal("hide");
            }).error(function(data, status, hedaer, config) {
                alert("添加失败");
            });
        };
        //点击修改 获取查询到的数据
        $scope.Revise = function(i) {
            $scope.userReviseForm = {};
            $scope.userReviseForm.orgName = $scope.OperatorTD[i].orgName;
            $scope.userReviseForm.userId = $scope.OperatorTD[i].userId;
            $scope.userReviseForm.name = $scope.OperatorTD[i].name;
            $scope.userReviseForm.sex = $scope.OperatorTD[i].sex;
            $scope.userReviseForm.code = $scope.OperatorTD[i].code;
            // $scope.userReviseForm.password = $scope.OperatorTD[i].password;
            $scope.userReviseForm.address = $scope.OperatorTD[i].address;
            $scope.userReviseForm.tel = $scope.OperatorTD[i].tel;
            $scope.userReviseForm.email = $scope.OperatorTD[i].email;
            $scope.userReviseForm.status = $scope.OperatorTD[i].status;
            $scope.userReviseForm.status_date = $scope.OperatorTD[i].status_date;
            $("#orgOrg").val($scope.OperatorTD[i].orgId);
        };
        //点击确定修改 将用户修改的数据传给后台
        $scope.userRevise = function() {
            $scope.userReviseForm.orgId = $("#orgOrg").find("option:selected").val();
            console.log("发送OrgID-----------------" + $("#orgOrg").find("option:selected").val());
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUser_update.action',
                data: JSON.stringify($scope.userReviseForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                selectuser();
                console.log("发送的东西-----------------" + JSON.stringify($scope.userReviseForm));
            }).error(function(data, status, hedaer, config) {
                alert("更新失败");
            });
            console.log($scope.userRevise);
        };
        //删除
        $scope.deleteOperatorTD = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUser_delete.action?userId=' + i,
                //                 data:JSON.parse(i),
                //                 dataType:"json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面
                selectuser();
                console.log("发送的东西-----------------" + JSON.stringify(i));
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        //条件查询
        $scope.OperatorS = function() {
            $http.get('sysUser_queryList.action?name=' + $scope.OperatorSearch.name + '&address=' + $scope.OperatorSearch.address + '&code=' + $scope.OperatorSearch.code).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };

        function queryUserRole() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUserRole_queryList.action?roleId=' + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                ctrl.userRole = JSON.parse(data);
            }).error(function(data, header, config, status) {
                alert("查询失败");
            });
        }

        function queryNoUserRole() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUserRole_queryNoUseFuncList.action?roleId=' + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                ctrl.noUserRole = JSON.parse(data);
            }).error(function(data, header, config, status) {
                alert("查询失败");
            });
        }
        var k;
        //——操作员管理▷▷→权限管理
        var ctrl = this;
        //查询
        $scope.Jurisdiction = function() {
            $http.get('sysRole_getRoleList.action').success(function(data, status, headers, congfig) {
                $scope.roleId = JSON.parse(data);
                console.log(data);
            }).error(function(data, status, headers, congfig) {
                alert("获取失败");
            });
            $("#sel").change(function() {
                k = $("#sel").find("option:selected").val();
                //k这是下拉框的key值
                queryUserRole();
                queryNoUserRole();
            });
        };
        ctrl.userChange = function(values) { console.log(values); }; //点击转换按钮添加的值
        //点击保存要给后台的值
        $scope.Preservation = function() {
            var userIds = [];
            for (var i = 0; i < ctrl.userRole.length; i++) {
                userIds.push(ctrl.userRole[i].id);
            }
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysUserRole_saveRoleFunctions.action?userIds=' + userIds + "&roleId=" + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                queryNoUserRole();
                ctrl.noUserRole = JSON.parse(data);
            }).error(function(data, header, config, status) {
                alert("添加失败");
            });
            console.log(userIds);
        };
    }])
    //下面是验证用户填写的信息——————————这东西只需要一遍
    .directive('compare', function() {
        var o = {};
        o.strict = "AE";
        o.scope = { orgText: "=compare" };
        o.require = "ngModel";
        o.link = function(sco, ele, att, con) {
            con.$validators.compare = function(v) {
                return v == sco.orgText;
            };
            sco.$watch("orgText", function() {
                con.$validate();
            });
        };
        return o;
    })
    /********************参数管理**********************/
    .controller('parameter', ['$scope', '$http', 'pagenation',function($scope, $http,pagenation) {
        //在资费内循环输出下面的内容
        paraInit();
        $scope.parameterTd = [];

        function paraInit() {
            //获取数据
            $http.get('sysAttr_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
              $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        var parameterId;
        $scope.withinParameter = function(k) {
            console.log(parameterId = k);
            //alert(k)
        };
        //点击添加确认传给后台 用户输入的值
        $scope.parameterAdd = function() {};
        //点击添加确认 向后台传用户输入的值
        $scope.parameterTdOK = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttr_add.action',
                method: 'POST',
                data: JSON.stringify($scope.parameterAddForm),
                dataType: "json",
            }).success(function(data, header, config, status) {
                console.log($scope.parameterAddForm);
                paraInit();
                alert("响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //删除
        $scope.deleteParameter = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttr_delete.action?attrId=' + i,
            }).success(function(data, status, config, header) {
                paraInit();
                console.log("发送的东西-----------------" + JSON.stringify(i));
                alert("成功响应");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
        //点击资费的修改
        $scope.ReviseParameter = function(i) {
            $scope.parameterReviseForm = {};
            $scope.parameterReviseForm.attrName = $scope.parameterTd[i].attrName;
            $scope.parameterReviseForm.attrCode = $scope.parameterTd[i].attrCode;
            $scope.parameterReviseForm.comments = $scope.parameterTd[i].comments;
            $scope.parameterReviseForm.attrId = $scope.parameterTd[i].attrId;
        };
        //点击修改的确认
        $scope.parameterReviseTd = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttr_update.action',
                method: 'POST',
                data: JSON.stringify($scope.parameterReviseForm),
                dataType: "json",
            }).success(function(data, header, config, status) {
                console.log($scope.parameterReviseForm);
                paraInit();
                alert("响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
            //          $scope.parameterReviseForm  这是用户修改后的值
        };
        //搜索
        $scope.ParameterSearch = function() {
            $http.get('sysAttr_queryList.action?attrName=' + $scope.parameterSearch.attrName + '&attrCode=' + $scope.parameterSearch.attrCode).then(function(response) {
                // $scope.data = JSON.parse(response.data);
              $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.parameterSearch);
        };
        //查看参数值列表
        var parameterId;
        $scope.InstTd = [];

        function queryAttr(k) {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttrValue_queryList.action?attrId=' + k,
                method: 'GET',
            }).success(function(data, header, config, status) {
                //在参数值Td内循环添加下面的内容
                $scope.InstTd = JSON.parse(data);
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        }
        $scope.withinParameter = function(k) {
            console.log(parameterId = k);
            queryAttr(k);
        };
        //点击添加套餐
        $scope.ParameterADD = function(i) {
            alert(i); //用户点击行的ID
            $scope.ParADDForm = {};
            $scope.ParADDForm.attrId = i;
        };
        //点击添加确定参数值
        $scope.ParTdOK = function() {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttrValue_add.action',
                method: 'POST',
                data: JSON.stringify($scope.ParADDForm),
                dataType: "json",
            }).success(function(data, header, config, status) {
                console.log($scope.ParADDForm);
                paraInit();
                alert("响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //删除套餐
        $scope.deleteInstTd = function(i) {
            $http({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttrValue_delete.action?attrValueId=' + i + "&attrId=" + parameterId,
                method: 'GET',
            }).success(function(data, header, config, status) {
                queryAttr(parameterId);
                alert("处理响应成功");
            }).error(function(data, header, config, status) {
                alert("处理响应失败");
            });
        };
        //修改参数值
        $scope.ReviseInstTd = function(i) {
            $scope.ReviseInstForm = {};
            $scope.ReviseInstForm.attrValueMark = $scope.InstTd[i].valueMark;
            $scope.ReviseInstForm.attrValue = $scope.InstTd[i].value;
            $scope.ReviseInstForm.attrValueId = $scope.InstTd[i].id.attrValueId;
            $scope.ReviseInstForm.attrId = $scope.InstTd[i].id.attrId;
        };
        //点击参数值修改确认
        $scope.parameterReviseTd = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysAttrValue_update.action',
                data: JSON.stringify($scope.ReviseInstForm),
            }).success(function(data, status, config, header) {
                queryAttr(parameterId);
                console.log("发送的东西-----------------" + $scope.ReviseInstForm.attrId);
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        };
    }])
    /********************操作日志**********************/
    .controller('operationlog',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        select();
        //页面总查询
        function select() {
            $http.get('operationLog_query.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
              $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };
        //操作日志条件搜索
        $scope.search = function() {
            console.log($scope.searchList.username)
                // document.getElementById ("startDate").result();
                // document.getElementById ("endDate").result();
            $http.get('operationLog_query.action?userName=' + $scope.searchList.username + '&startDate=' + $scope.searchList.startDate + '&endDate=' + $scope.searchList.endDate).then(function(response) {
                // $scope.data = JSON.parse(response.data);
              $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.searchList.roleName);
        };
    }])
    /******************组织管理*************************/
    .controller('Org',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        //————组织管理
        select();
        //页面总查询
        function select() {
            $http.get('sysOrg_queryList.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        };
        //下拉框内容
        $scope.status = { V: "有效", I: "无效", T: "过期" };
        $scope.functionSys_OrgForm = {};
        //添加
        $scope.functionSys_OrgAddForm = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysOrg_add.action',
                data: JSON.stringify($scope.functionSys_OrgForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //添加成功后跳转查询页面
                select();
                $("#myModalLabelOrgAdd").modal("hide");
            }).error(function(data, status, hedaer, config) {
                alert("添加失败");
            });
        };
        //删除
        $scope.OrgdeleteTd = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysOrg_delete.action?orgId=' + i,
                //                   data:JSON.parse(i),
                //                   dataType:"json",
            }).success(function(data, status, config, header) {
                //添加成功后跳转查询页面
                select();
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        //条件查询
        $scope.Orgsearch = function() {
            $http.get('sysOrg_queryList.action?orgName=' + $scope.OrgsearchList.orgName + '&status=' + $scope.OrgsearchList.status).then(function(response) {
                // $scope.data = JSON.parse(response.data);
               $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
            console.log($scope.OrgsearchList.orgName);
        };
        //点击修改Td默认的值
        $scope.OrgreviseTd = function(i) {
            $scope.func_OrgFormR = {};
            $scope.func_OrgFormR.orgName = $scope.functionSys_OrgeTd[i].orgName;
            $scope.func_OrgFormR.status = $scope.functionSys_OrgeTd[i].status;
            $scope.func_OrgFormR.orgId = $scope.functionSys_OrgeTd[i].orgId;
        };
        //向后台传的 修改的值
        $scope.func_OrgFormRTO = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'sysOrg_update.action',
                data: JSON.stringify($scope.func_OrgFormR),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //添加成功后跳转查询页面
                select();
            }).error(function(data, status, hedaer, config) {
                alert("更新失败");
            });
            console.log($scope.func_OrgFormR);
        };
    }])
    //-----------------供应商--------------------------
    /******************财务管理——充值*************************/
    .controller('recharge',['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        //查询
        //查询成员全列表
        paymentInit();

        function paymentInit() {
            $http.get('recharge_search.action').then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
            });
        }
        //搜素
        $scope.searchPayment = function() {
            $scope.searchPaymentForm = {};
            $http.get('recharge_search.action?acctName=' + $scope.searchPaymentForm.acctName + "&custName=" + $scope.searchPaymentForm.custName + "&customertype=" + $scope.searchPaymentForm.customertype)
                .success(function(response) {
                    // $scope.data = JSON.parse(response.data);
                    $scope.customertype = JSON.parse(response.data);
                $scope.pageData = JSON.parse(response.data);
                pagenation.pags($scope)
                });
        };
        // 获取某行的ID
        var acctId, custId, lastbal, grossbal;
        $scope.paymentTd = function(i, aid, cid) {
                $scope.acctName = $scope.paymentTD[i].acctName;
                if ($scope.paymentTD[i].grossBal == null) {
                    $scope.grossBal = 0;
                    lastbal = 0;
                    grossbal = 0;
                } else {
                    $scope.grossBal = $scope.paymentTD[i].grossBal;
                    grossbal = $scope.paymentTD[i].grossBal
                    lastbal = $scope.paymentTD[i].lastbal
                }
                acctId = aid;
                custId = cid;
            }
        // 充值
        $scope.paymentAddOk = function() {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'recharge_payIt.action?acctId=' + acctId + "&custId=" + custId + "&lastbal=" + lastbal + "&amount=" + $("#amount").val() + "&grossbal=" + grossbal,
            }).success(function(data, status, config, header) {
                paymentInit();
                alert("处理成功后的响应");
            }).error(function(data, status, hedaer, config) {
                alert("处理失败后的响应");
            });
        }
    }])
    /******************小号充值*************************/
    .controller('clarinoRecharge', ['$scope', '$http',function($scope, $http) {
        // 设置阈值
        $scope.RechargeSet = function(vel) {
            console.log(vel)
        }
        var OrderArr=[];
        // 确认充值
        $scope.RechargeAdd = function() {
            $scope.clarinoRechargeForm // 表单数据
            if ($scope.clarinoRechargeForm.P2_mobile.constructor == Array) return; // 判断如果已经是数组就不向下执行
            $scope.clarinoRechargeForm.P2_mobile = $scope.clarinoRechargeForm.P2_mobile.split(",") //将字符串转化为数组放入P2_mobile中
            for(var i =0;i<$scope.clarinoRechargeForm.P2_mobile.length;i++){
                OrderArr.push(Math.round((Math.random() * 8 + 1) * 1E+15)) // 将生成的16位随机数放入数组中
            }
            $('#SeachOrder').val(OrderArr) // 放入订单查询框
            /*ajax*/
            alert("充值成功")
        }
        // 订单查询
        $scope.SeachOrder = function(){
            console.log(OrderArr)
            $http.get("data/clarinoRecharge.json").success(function(res){
                $scope.clarinoRechargeTD = res
            })
        }
    }])
    /******************充值记录*************************/
    .controller('payment', ['$scope', '$http', 'pagenation',function($scope, $http, pagenation) {
           $http.get('data/payment.json').success(function(response) {
                $scope.pageData = response;
                pagenation.pags($scope)
            }).error(function(res){
                console.log(res)
            });
    }])
    /******************话单查询*************************/
    .controller("statistics",['$scope', '$http', 'pagenation', function($scope, $http,pagenation) {
        $(function() {
            $scope.audioID = function(Aid, index) {
                $http.get('cdr_mp3Player.action?callId=' + Aid + '&callTime=' + $scope.statisticsTD[index].call_time + '&phoneNo=' + $scope.statisticsTD[index].phone_no +
                    '&secretNo=' + $scope.statisticsTD[index].secret_no +
                    '&peerNo=' + $scope.statisticsTD[index].peer_no).then(function(response) {
                    $scope.MP3Audio = "mp3/" + Aid + ".mp3";
                    $("source")[index].src = $scope.MP3Audio
                    $("audio")[index].load();
                });
                $scope.Boolean = Aid;
                $http.get('cdr_deleteMp3Audio.action').then(function(response) {
                    console.log(response.data);
                });
            }
        })
        $scope.cdrSearch = function() {
            $http.get('cdr_query.action?callingNo=' + $scope.SearchForm.callingNo + '&calledNo=' + $scope.SearchForm.calledNo + '&callType=' + $scope.SearchForm.callType + '&callStartTime=' + $scope.SearchForm.callStartTime + '&callEndTime=' + $scope.SearchForm.callEndTime).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                 $scope.pageData = response;
                pagenation.pags($scope)
            });
        };
        $scope.SearchForm = {} //用户搜索的值
    }])
    /*********************账单查询**********************/
    .controller("bill",['$scope', '$http', function($scope, $http) {
        $scope.billSerach = function() {
            $http.get('data/bill.json' // + $scope.SearchForm.tel + '&month=' + $scope.SearchForm.month
                ).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.billTD = response.data
               // console.log(response.data);
            })
        }

        $scope.SearchForm = [] //账户搜索的值
    }])
    /********************* 通话行为分析 **********************/
    .controller("CallBehavior", ['$scope', '$http',function($scope, $http) {

        /*
            $.getJSON('data/bill.json', function(chart) {
                $scope.billTD = chart
                console.log(chart)
            })
        */
    }])
    /*********************USSD数据统计**********************/
    .controller("UssdStatistics", ['$scope', '$http',function($scope, $http) {
        $("#loading").hide(); // 默认loading动画隐藏

        $scope.changes = function(tt) {
                if (tt == undefined) {
                    $(".seachFunc").html("按天份查询：")
                    $("#seachFunc").attr("onfocus", "WdatePicker({lang:'zh-cn',dateFmt:'yyyy-MM-dd',onpicked: function(){$(this).trigger('change')}} )")
                }
                if (tt == "Y") {
                    $(".seachFunc").html("按月份查询：")
                    $("#seachFunc").attr("onfocus", "WdatePicker({lang:'zh-cn',dateFmt:'yyyy-MM',onpicked: function(){$(this).trigger('change')}} ) ")
                }
            }
            //----------点击查询后触发的事件
        $scope.UssdStatisSerach = function() {
                console.log($scope.SearchForm)
                if ($scope.SearchForm != undefined) {
                    $scope.UssdToTD = "";
                    $("#loading").show(); // 点击搜索按钮loading动画显示
                    $http.get('ussdStatistics_ussdStatisticByDay?day=' + $scope.SearchForm.day).success(function(data, status, headers, congfig) {
                        if (data) {
                            $scope.UssdToTD = data;
                        } else {
                            $("#loading>h3").html('当前没有数据！')
                        }
                        $("#loading").hide(); // 点ajax执行成功loading动画隐藏

                    }).error(function(data, status, headers, congfig) {
                        alert("获取失败");
                    });
                } else {
                    alert("请选择一个日期")
                }
            }
            // 报表导出
        var $exportLink = document.getElementById('exportUssdStatistics');
        $exportLink.addEventListener('click', function(e) {
            $exportLink.setAttribute("data-type", $("#selectedUssdStatistics").find("option:selected").val())
            tableExport('tableUssdStatistics', 'ussd发送数据统计', e.target.getAttribute('data-type'));
        }, false);
    }])
    /*********************小号通话统计**********************/
    .controller("clarinoCallStatistics",['$scope', '$http', function($scope, $http) {
        $("#ToDayLoading").hide(); // 默认ToDayLoading动画隐藏

          // 获取客户名称
          $http.get('data/clarinoCallStatistics.json').success(function(data){
            $scope.CNMonthForm = data[27].select  // 月
            $scope.CNDayForm = data[27].select    // 日
            console.log(data[27].select)
          }).error(function(data, status, headers, congfig) {alert("获取失败");});

        // 按月查询
        $scope.ToMonthSerach = function() {
                $scope.ToMonthToTD = "";
                if ($scope.SearchToMonth != undefined && $("#CNToMonth").val() != undefined) {
                    $http({
                        method:"GET",
                        url:'data/clarinoCallStatistics.json',
                        data:{
                            SearchToMonth: $scope.SearchToMonth,
                            CNToMonth: $("#CNToMonth").val()
                        }
                        }).success(function(data, status, headers, congfig) {
                            if (data) {
                                $scope.ToMonthToTD = data;
                            } else {
                                alert('当前没有数据！')
                            }
                        }).error(function(data, status, headers, congfig) {
                            alert("获取失败");
                        });
                }
                if ($scope.SearchToMonth == undefined || $("#CNToMonth").val() == undefined) {
                    function hideCB() { $(".bubble-box").hide() }
                    $(".bubble-box").show(setTimeout(hideCB, 2000));
                }
            }

        var nextString = '<tr id="onNext" style="cursor:pointer;"><td colspan="5"></td><td colspan="3">点此加载更多……</td><td colspan="5"></td></tr>';
        // 按天查询
        $scope.ToDaySerach = function() {
                $scope.ToDayToTD = "";
                if ($scope.SearchToDay != undefined && $("#CNToDay").val() != undefined) {
                    $("#ToDayLoading").show(); // 点击搜索按钮ToDayLoading动画显示
                    $("#tableToDay").empty();
                    $http({
                        method:"GET",
                        url:'data/clarinoCallStatistics.json',
                        data:{
                            SearchToDay: $scope.SearchToDay,
                            CNToDay: $("#CNToDay").val()
                        }
                        })
                        .success(function(data, status, headers, congfig) {
                            if (data) {
                                $("#tableToDay").html(
                                '<tr class="bg-info"><th>客户名称</th><th>小号</th><th>小号归属地</th><th>话单记录数</th><th>拒接数</th><th>接通数</th><th>回拨数</th><th>回拨接通数</th><th>回拨接通率%</th><th>客服主动拨打</th><th>总通话秒数</th><th>接通平均通话秒数</th><th>总平均通话秒数</th><th>接通率</th><th>总通话分钟数</th></tr>');
                                $(data).each(function(key, value){
                                    $("#tableToDay").append(
                                         "<tr>"  // 判断后台传来的数据如果是undefined显示为0，不是显示原数据
                                            + "<td>"+ (value.duration === undefined ? 0 : value.duration) +"</td>"
                                            + "<td>"+ (value.acms === undefined ? 0 : value.acms) +"</td>"
                                            + "<td>"+ (value.district === undefined ? 0 : value.district) +"</td>"
                                            + "<td>"+ (value.dial === undefined ? 0 : value.dial) +"</td>"
                                            + "<td>"+ (value.reject === undefined ? 0 : value.reject) +"</td>"
                                            + "<td>"+ (value.dial === undefined ? 0 : value.dial) +"</td>"
                                            + "<td>"+ (value.callback === undefined ? 0 : value.callback) +"</td>"
                                            + "<td>"+ (value.averageconn === undefined ? 0 : value.averageconn) +"</td>"
                                            + "<td>"+ (value.cdrno === undefined ? 0 : value.cdrno) +"</td>"
                                            + "<td>"+ (value.rateofconn === undefined ? 0 : value.rateofconn) +"</td>"
                                            + "<td>"+ (value.rateofcallbackconn === undefined ? 0 : value.rateofcallbackconn) +"</td>"
                                            + "<td>"+ (value.totalaverageconn === undefined ? 0 : value.totalaverageconn) +"</td>"
                                            + "<td>"+ (value.minutes === undefined ? 0 : value.minutes) +"</td></tr>");
                                })
                                $("#tableToDay").append(nextString)
                            } else {
                                $("#ToDayLoading>h3").html('当前没有数据！');
                            }
                            $("#ToDayLoading").hide(); // 点ajax执行成功ToDayLoading动画隐藏
                        }).error(function(data, status, headers, congfig) {
                            alert("获取失败");
                        });
                }
                if ($scope.SearchToDay == undefined ||$("#CNToDay").val() == undefined) {
                    function hideCB() { $(".bubble-box").hide() }
                    $(".bubble-box").show(setTimeout(hideCB, 2000));
                }
            }


          // 滑动到底部后每次点击获取下一组表格数据
          $("#tableToDay").on("click","#onNext", function (){
               $(this).empty()
               getNextPages()
          })

          var pn = 2;
          function getNextPages(){
                $("#ToDayLoading").show();
                $http.get('data/clarinoCallStatistics.json?id' + pn++)
                    .success(function(data, status, headers, congfig) {
                        if (data) {
                            $(data).each(function(key, value){
                                $("#tableToDay").append(
                                    "<tr>" +  // 判断后台传来的数据如果是undefined显示为0，不是显示原数据
                                          "<td>"+ (value.duration === undefined ? 0 : value.duration) +"</td>"
                                        + "<td>"+ (value.acms === undefined ? 0 : value.acms) +"</td>"
                                        + "<td>"+ (value.district === undefined ? 0 : value.district) +"</td>"
                                        + "<td>"+ (value.dial === undefined ? 0 : value.dial) +"</td>"
                                        + "<td>"+ (value.reject === undefined ? 0 : value.reject) +"</td>"
                                        + "<td>"+ (value.dial === undefined ? 0 : value.dial) +"</td>"
                                        + "<td>"+ (value.callback === undefined ? 0 : value.callback) +"</td>"
                                        + "<td>"+ (value.averageconn === undefined ? 0 : value.averageconn) +"</td>"
                                        + "<td>"+ (value.cdrno === undefined ? 0 : value.cdrno) +"</td>"
                                        + "<td>"+ (value.rateofconn === undefined ? 0 : value.rateofconn) +"</td>"
                                        + "<td>"+ (value.rateofcallbackconn === undefined ? 0 : value.rateofcallbackconn) +"</td>"
                                        + "<td>"+ (value.totalaverageconn === undefined ? 0 : value.totalaverageconn) +"</td>"
                                        + "<td>"+ (value.minutes === undefined ? 0 : value.minutes) +"</td>"+
                                    "</tr>"
                                 )
                            })
                             $("#tableToDay").append(nextString)
                        } else {
                             $("#tableToDay").append('<tr id="onNext"><td colspan="5"></td><td colspan="3">没有更多数据了……</td><td colspan="5"></td></tr>')
                        }
                        $("#ToDayLoading").hide(); // 点ajax执行成功ToDayLoading动画隐藏
                    }).error(function(data, status, headers, congfig) {
                        alert("获取失败");
                    });
          }

            // 导出月表格
        var $exportToMonth = document.getElementById('exportToMonth');
        $exportToMonth.addEventListener('click', function(e) {
            $exportToMonth.setAttribute("data-type", $("#selectedToMonth").find("option:selected").val())
            tableExport('tableToMonth', '月统计表', e.target.getAttribute('data-type'));
        }, false);
            // 导出日表格
        var $exportToDay = document.getElementById('exportToDay');
        $exportToDay.addEventListener('click', function(e) {
            $exportToDay.setAttribute("data-type", $("#selectedToDay").find("option:selected").val())
            tableExport('tableToDay', '日统计表', e.target.getAttribute('data-type'));
        }, false);
    }])
    /*********************短信业务量统计**********************/
    .controller("SmsTrafficStatistics", ['$scope', '$http',function($scope, $http) {
        $("#loading2").hide(); // 默认loading动画隐藏

        //---------下面是点击搜索执行的事件
        $scope.SmsTrafficSerach = function() {
                $("#loading2").show(); // 点击搜索按钮loading2动画显示
                $scope.SmsTrafficToTD = "";
                if ($scope.STSStartDate != undefined && $scope.STSEndDate != undefined && $scope.STSCustomerName != undefined) {
                    $http.get('data/SmsTrafficStatistics.json')
                        .success(function(data, status, headers, congfig) {
                            if (data) {
                                $scope.SmsTrafficToTD = data;
                                // 数据汇总
                                $scope.ArrSum = [];
                                var sumRateofincr = sumSucc = sumFail = sumRateofsucc = 0;
                                var suminto;
                                angular.forEach(data, function(value, key) {
                                    sumRateofincr += value.rateofincr
                                    sumSucc += value.succ
                                    sumFail += value.fail
                                    sumRateofsucc += value.rateofsucc
                                    suminto = { sumRateofincr, sumSucc, sumFail, sumRateofsucc };
                                    return suminto
                                });
                                $scope.ArrSum.push(suminto)

                            } else {
                                $("#loading2>h3").html('当前没有数据！')
                            }
                            $("#loading2").hide();
                        }).error(function(data, status, headers, congfig) {
                            alert("获取失败");
                        });
                }
                if ($scope.STSStartDate == undefined || $scope.STSEndDate == undefined || $scope.STSCustomerName == undefined) {
                    function hideCB() { $(".bubble-box").hide() }
                    $(".bubble-box").show(setTimeout(hideCB, 2000));

                }
            }
            // 日报表导出
        var $exportLink = document.getElementById('exportSmsTrafficStatistics');
        $exportLink.addEventListener('click', function(e) {
            $exportLink.setAttribute("data-type", $("#selectedSmsTrafficStatistics").find("option:selected").val())
            tableExport('tableSmsTrafficStatistics', '短信业务量统计', e.target.getAttribute('data-type'));
        }, false);
    }])
    /*********************短信模板**********************/
    .controller('SmsTemplate', ['$scope', '$http',function($scope, $http,pagenation) {
        //-------------------短信模板--------------------------
        //查询
        templateList();
        function templateList() {
            $http.get('template_queryList.action').then(function(response) {
                console.log(response.data);
                 $scope.pageData = response;
                pagenation.pags($scope)
            });
        }
        $scope.tStatus = { w: "等待审核", c: "审核成功", f: "审核失败" };
        //ussd模板
        $scope.UssdSubmit = function() {
            $scope.templateUssdForm.tType = "u";
            console.log($scope.templateUssdForm);
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'template_add.action',
                data: JSON.stringify($scope.templateUssdForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                templateList();
                console.log("发送的东西-----------------" + JSON.stringify($scope.templateUssdForm));
                $("#myModalUssd").modal("hide");
            }).error(function(data, status, hedaer, config) {
                alert("添加失败");
            });
        };
        //sms模板
        $scope.SmsSubmit = function() {
            $scope.templateSmsForm.tType = "s";
            console.log($scope.templateSmsForm);
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'template_add.action',
                data: JSON.stringify($scope.templateSmsForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                templateList();
                console.log("发送的东西-----------------" + JSON.stringify($scope.templateSmsForm));
                $("#myModaSms").modal("hide");
            }).error(function(data, status, hedaer, config) {
                alert("添加失败");
            });
        };
        //修改
        $scope.Revise = function(i) {
            $scope.templateReviseForm                   = {};
            $scope.templateReviseForm.templateId        = $scope.templateTD[i].tTemplateId;
            $scope.templateReviseForm.realTid           = $scope.templateTD[i].tRealTid;
            $scope.templateReviseForm.cutId             = $scope.templateTD[i].tCutId;
            $scope.templateReviseForm.createUser        = $scope.templateTD[i].suName;
            $scope.templateReviseForm.content           = $scope.templateTD[i].tContent;
            $scope.templateReviseForm.paradesc          = $scope.templateTD[i].tParadesc;
            $scope.templateReviseForm.status            = $scope.templateTD[i].tStatus;
            $scope.templateReviseForm.auditfailedreason = $scope.templateTD[i].tAuditfailedreason;
            $scope.templateReviseForm.type              = $scope.templateTD[i].tType;
            $scope.templateReviseForm.tCreateUser       = $scope.templateTD[i].tCreateUser;
        };
        //提交修改
        $scope.ReviseTemplate = function() {
            $http({
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'template_update.action',
                data: JSON.stringify($scope.templateReviseForm),
                dataType: "json",
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                templateList();
            }).error(function(data, status, hedaer, config) {
                alert("修改失败");
            });
            console.log($scope.templateReviseForm);
        };
        //删除
        $scope.Delete = function(i) {
            $http({
                method: 'GET',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'template_delete.action?tTemplateId=' + i,
            }).success(function(data, status, config, header) {
                //跳转到查询页面刷新
                templateList();
                console.log("发送的东西-----------------" + JSON.stringify(i));
            }).error(function(data, status, hedaer, config) {
                alert("删除失败");
            });
        };
        // 搜索
        $scope.SearchForm = function() {
            $http.get('template_queryList.action?tType=' + $scope.SearchForms.type + "&tRealTid=" + $scope.SearchForms.realTid).then(function(response) {
                // $scope.data = JSON.parse(response.data);
                $scope.pageData = response;
                pagenation.pags($scope)
            });
        };

        //-------------------模板签名--------------------------
        // 查询
         $http.get('url').success(function(response) {
                $scope.autographTD = JSON.parse(response.data);
         }).error(function(){/*alert("模板签名获取失败")*/});
         // 添加签名
         $scope.AddSubmit = function(){
             $http.post('url?AddAutogreaph'+$scope.AutogreaphForm).success(function(response) {
                $("#AutographModal").modal("hide")
             }).error(function(){alert("添加签名失败")});
         }
         // 搜索签名
         $scope.SearchAutograph = function(){
             $http.post('url?SearchAutograph'+$scope.Search.Autograph).success(function() {
             }).error(function(){alert("搜索签名失败")});
         }
         // 删除签名
         $scope.DelAutograph = function(i){
             $http.post('url?DelAutograph'+ i).success(function() {
             }).error(function(){alert("签名删除失败")});
         }
         // 修改签名
         $scope.modifyAutograph = function(i){
                $scope.AutogreaphForm1 = {};
                $scope.AutogreaphForm1.modifyAutogreaphID = $scope.autographTD[i].autographName;
                // $scope.AutogreaphForm1.modifyRemarks = $scope.autographTD[i].Remarks;
         }
         // 修改签名
         $scope.modifySubmit = function(){
            $http.post('url?modifyAutograph'+ $scope.AutogreaphForm1).success(function() {
                 $("#modifyModal").modal("hide")
             }).error(function(){alert("修改删除失败")});
         }
    }])
    /*********************模板管理**********************/
    .controller("TemplateManagement",['$scope', '$http',function($scope, $http) {
        // 查询
        $http.get('data/TemplateManagement.json').success(function(data) {
            // $scope.TemplateManagementTD = JSON.parse(data);
            $scope.TemplateManagementTD = data;
        });
        // 添加
        $scope.AddTpl = function() {
            var variableLength = 0,reg = /#\*#/g;
              while (reg.exec($scope.tplAddForm.templateContent) != null) { variableLength++; }
            // $scope.tplAddForm.templateContent.length // 模板内容的长度
            // variableLength  // #*# 的个数
            console.log($scope.tplAddForm)  // 所有添加的数据
        }

        // 点击修改
        $scope.modifyTpl = function(i){
            $scope.tplModifyForm = {}
            $scope.tplModifyForm.id              = $scope.TemplateManagementTD[i].id;
            $scope.tplModifyForm.time            = $scope.TemplateManagementTD[i].time;
            $scope.tplModifyForm.signature       = $scope.TemplateManagementTD[i].signature;
            $scope.tplModifyForm.msgtype         = $scope.TemplateManagementTD[i].msgtype;
            $scope.tplModifyForm.templateContent = $scope.TemplateManagementTD[i].templateContent;
            $scope.tplModifyForm.templateContent = $scope.TemplateManagementTD[i].templateContent;
            $scope.tplModifyForm.variable        = $scope.TemplateManagementTD[i].variable;
            $scope.tplModifyForm.description     = $scope.TemplateManagementTD[i].description;
        }
        // 保存修改
        $scope.modifyTplOk = function(){
            console.log($scope.tplModifyForm)
        }
        // 删除
        $scope.Delete = function(i){
            alert(i)
        }
    }])
    /*********************模板审核**********************/
    .controller("auditTmp",['$scope', '$http', function($scope, $http) {
        // 页面加载获取数据
        $http.get('URL').then(function(response) {
            $scope.auditTmpTD = JSON.parse(response.data);
        })
        // 变更模板类型触发
        $scope.TmpType = function(type) {
            if (type == '') {type = 'all'}
            $http.post('URL?type=' + type).then(function(response) {
                $scope.auditTmpTD = JSON.parse(response.data);
            })
        }
        // 触发输入审核ID弹框
        $scope.auditM = function(){$('#auditModal').modal("show");}
        // 触发审核失败弹框
        $scope.failAuditM = function(){$('#failAuditModal').modal("show");}
        // 发送审核模板的数据
        $scope.confirm = function(TmpID){
            $http.post('URL?TmpID=' + TmpID).success(function(response) {
                $('#auditModal').modal("hide");
            }).error(function(){alert("模板审核失败！")})
        }
        // 发送审核模板的数据
        $scope.failConfirm = function(failTmpID){
            $http.post('URL?failTmpID=' + failTmpID).success(function(response) {
               $('#failAuditModal').modal("hide");
            }).error(function(){alert("模板审核失败！")})
        }
    }])
    .controller("resetPassword",["$scope","$http",function($scope, $http){

        $scope.postResetForm = function(){

            console.log($scope.PResetPwdForm)
        if ($scope.PResetPwdForm && $scope.PResetPwdForm.userName && $scope.PResetPwdForm.Pwd && $scope.PResetPwdForm.Pwd1 == undefined) {

             $http({
                    method: 'POST',
                    // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    url: 'Url',
                    data: $scope.PResetPwdForm,
                    // dataType: "json"
                    responseType: "json"
                }).success(function(data, status, config, header) {

                }).error(function(data, status, hedaer, config) {
                    alert("密码修改失败！");
                });

            }else{alert("您输入的信息有误~")}
        }
    }])
    //- 页面切换路径
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            // 财务管理
            .when('/welcome', { templateUrl: 'tpl/CustomerManagement/service.html' })
            .when('/member', { templateUrl: 'tpl/CustomerManagement/member.html' })
            .when('/account', { templateUrl: 'tpl/CustomerManagement/account.html' })
            .when('/Authentication', { templateUrl: 'tpl/CustomerManagement/Authentication.html' })
            .when('/BalanceInquiry', { templateUrl: 'tpl/CustomerManagement/BalanceInquiry.html' })
            .when('/customer', { templateUrl: 'tpl/CustomerManagement/customer.html' })
            // 资源管理
            .when('/secret_no', { templateUrl: 'tpl/ResourceManagement/secret_no.html' })
            // 资费管理
            .when('/priceplan', { templateUrl: 'tpl/TariffManagement/priceplan.html' })
            .when('/CustProduct', { templateUrl: 'tpl/TariffManagement/CustProduct.html' })
            .when('/MemberProduct', { templateUrl: 'tpl/TariffManagement/MemberProduct.html' })
            // 系统管理
            .when('/Operator', { templateUrl: 'tpl/SystemManagement/Operator.html' })
            .when('/Administration', { templateUrl: 'tpl/SystemManagement/Administration.html' })
            .when('/parameter', { templateUrl: 'tpl/SystemManagement/parameter.html' })
            .when('/org', { templateUrl: 'tpl/SystemManagement/Org.html' })
            .when('/operationLog', { templateUrl: 'tpl/SystemManagement/operationLog.html' })
            .when('/role', { templateUrl: 'tpl/SystemManagement/role.html' })
            // 供应商
            .when('/provider', { templateUrl: 'tpl/provider.html' })
            // 财务管理
            .when('/payment', { templateUrl: 'tpl/FinanceManagement/payment.html' })
            .when('/recharge', { templateUrl: 'tpl/FinanceManagement/recharge.html' })
            .when('/clarinoRecharge', { templateUrl: 'tpl/FinanceManagement/clarinoRecharge.html' })
            // 统计报表
            .when('/bill', { templateUrl: 'tpl/StatisticalReport/bill.html' })
            .when('/CallBehavior', { templateUrl: 'tpl/StatisticalReport/CallBehavior.html' })
            .when('/callStatistics', { templateUrl: 'tpl/StatisticalReport/callStatistics.html' })
            .when('/clarinoCallStatistics', { templateUrl: 'tpl/StatisticalReport/clarinoCallStatistics.html' })
            .when('/SmsTrafficStatistics', { templateUrl: 'tpl/StatisticalReport/SmsTrafficStatistics.html' })
            .when('/UssdStatistics', { templateUrl: 'tpl/StatisticalReport/UssdStatistics.html' })
            // 模板管理
            .when('/TemplateManagement', { templateUrl: 'tpl/TemplateManagement/TemplateManagement.html' })
            .when('/auditTmp', { templateUrl: 'tpl/TemplateManagement/auditTmp.html' })
            .when('/SmsTemplate', { templateUrl: 'tpl/TemplateManagement/SmsTemplate.html' })

            .when('/system', { templateUrl: 'tpl/system.html' })
            .when('/balance', { templateUrl: 'tpl/balance.html' })
            .when('/userInfo', { templateUrl: 'tpl/userInfo.html' })
            .when('/resetPwd', { templateUrl: 'tpl/resetPwd.html' })
            .otherwise({ redirectTo: '/welcome' });
    }]);
