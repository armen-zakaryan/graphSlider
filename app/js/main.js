var app = angular.module('GraphSlider', ['ngRoute']);

//NodesCtrl
app.controller('NodesCtrl', ['$scope', 'NodeSvc',
    function($scope, NodeSvc) {
        $scope.searchValue;
        $scope.rootNode;
        $scope.neighbourNodes;
        $scope.links;
        $scope.pointsMap = {};
        $scope.limit = 20;
        var ctx;

        $scope.resetCanvas = function() {
            ctx && ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }

        $(window).bind('resize', function(e) {
            window.resizeEvt;
            $(window).resize(function() {
                clearTimeout(window.resizeEvt);
                window.resizeEvt = setTimeout(function() {
                    $scope.draw();
                }, 250);
            });
        });

        function calcCenter(el) {
            var offset = el.offset();
            return {
                x: offset.left + el.width() / 2,
                y: offset.top + el.height() / 2
            }
        }
        $scope.setPoint = function(nodeNumber, offset) {
            $scope.pointsMap[nodeNumber] = offset;
        }

        $scope.draw = function(_ctx) {
            !ctx && (ctx = _ctx);
            $scope.resetCanvas();
            $scope.links.forEach(function(element, index, array) {
                var from = calcCenter($scope.pointsMap[element.nodeID]);
                var to = calcCenter($scope.pointsMap[element.linkedNodeID]);
                ctx.beginPath();
                from && ctx.moveTo(+from.x, +from.y);
                to && ctx.lineTo(+to.x, +to.y);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#444';
                ctx.stroke();
            });
        }

        $scope.findSelectedNode = function(node) {
            $scope.searchValue = null;
            NodeSvc.findRootById(node.nodeID).then(function(node) {
                $scope.links = node.data.links;
                //root Node has been separated from it's neighbours
                $scope.rootNode = _.remove(node.data.nodes, function(el) {
                    return el.nodeID == node.data.root;
                });
                $scope.neighbourNodes = node.data.nodes;
            });
        };

        $scope.$watch('searchValue', function(val) {
            if (val) {
                NodeSvc.findNode(val).then(function(res) {
                    $scope.result = res.data;
                }, function() {
                    $scope.result = undefined;
                });
            } else $scope.result = undefined;
        });
    }
]);







//Directives
app.directive('neighbourElement', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.setPoint(attr.id, $(element));
        }
    }
});

app.directive('draw', function($timeout) {
    return {
        restrict: 'E',
        link: function(scope, element, attr) {
            var ctx = $('<canvas/>', {
                heiGht: window.innerHeight,
                widtH: window.innerWidth
            });

            $(element).append(ctx);
            var ctx = element.find('canvas')[0].getContext('2d');

            scope.$on('ngRepeatFinished', function() {
                $timeout(function() {
                    scope.draw(ctx);
                });
            });

            $(window).resize(function() {
                scope.resetCanvas();
            });
        }
    }
});

app.directive('onFinishRender', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                scope.$emit('ngRepeatFinished');
            }
        }
    }
});



//Services
app.service('NodeSvc', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var _url = 'https://ggg.vostan.net/aua_swe/class/api.php';

    this.findNode = function(val) {
        return $http({
            url: _url + '/nodes?term=' + val,
            method: 'GET'
        });
    };

    this.findRootById = function(nodeId) {
        return $http({
            url: _url + '/map/root/' + nodeId,
            method: 'GET'
        });

    };

});