// 权限管理
"use strict"
angular.module("md1").directive('selectLR',function () {
    return {
        restrict: 'ACE',
        templateUrl: 'tpl/SystemManagement/sel-l-r.html',
        scope:{
            slots:'=selectLR',
            values:'=selectLRValues',
            selChange:'&selectLRChange'
        },
        link: function(scope, el, attrs){
            var ctrl = scope;
            ctrl.selectSlots = [];
            ctrl.selectValues = [];
            ctrl.slotSelectsAdd = function () {
                var slots = [];
                ctrl.selectSlots.forEach(function (v,i) {
                    ctrl.slots.forEach(function (m,n) {
                        if(parseInt(m.id) == parseInt(v) ){
                            slots.push(m);
                            ctrl.slots.splice(n,1)
                        }
                    });
                });
                ctrl.values= ctrl.values.concat(slots);
                ctrl.selectChange();
            };
            ctrl.slotSelectsDel = function () {
                var slots = [];
                ctrl.selectValues.forEach(function (v,i) {
                    ctrl.values.forEach(function (m,n) {
                        if(parseInt(m.id) == parseInt(v) ){
                            slots.push(m);
                            ctrl.values.splice(n,1)
                        }
                    });
                });
                ctrl.slots = ctrl.slots.concat(slots);
                ctrl.selectChange();
            };
            ctrl.selectChange = function () {
                scope.selChange({values:ctrl.values})
            }
        }
    };
})
/* var selectLR = function () {
    return {
        restrict: 'ACE',
        templateUrl: 'tpl/SystemManagement/sel-l-r.html',
        scope:{
            slots:'=selectLR',
            values:'=selectLRValues',
            selChange:'&selectLRChange'
        },
        link: function(scope, el, attrs){
            var ctrl = scope;
            ctrl.selectSlots = [];
            ctrl.selectValues = [];
            ctrl.slotSelectsAdd = function () {
                var slots = [];
                ctrl.selectSlots.forEach(function (v,i) {
                    ctrl.slots.forEach(function (m,n) {
                        if(parseInt(m.id) == parseInt(v) ){
                            slots.push(m);
                            ctrl.slots.splice(n,1)
                        }
                    });
                });
                ctrl.values= ctrl.values.concat(slots);
                ctrl.selectChange();
            };
            ctrl.slotSelectsDel = function () {
                var slots = [];
                ctrl.selectValues.forEach(function (v,i) {
                    ctrl.values.forEach(function (m,n) {
                        if(parseInt(m.id) == parseInt(v) ){
                            slots.push(m);
                            ctrl.values.splice(n,1)
                        }
                    });
                });
                ctrl.slots = ctrl.slots.concat(slots);
                ctrl.selectChange();
            };
            ctrl.selectChange = function () {
                scope.selChange({values:ctrl.values})
            }
        }
    };
};*/