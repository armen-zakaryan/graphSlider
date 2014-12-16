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
        $scope.setPoint = function(nodeNumber, element, fromNaibour) {
            if (fromNaibour && $scope.rootNode[0].nodeID === $scope.selectedId) {
                $scope.draw();
                return;
            }
            $scope.pointsMap[nodeNumber] = element;
            $scope.draw();
        }

        $scope.draw = function(_ctx) {
            !ctx && (ctx = _ctx);
            $scope.resetCanvas();
            if ($scope.selectedId) {
                var from = calcCenter($scope.pointsMap[$scope.rootNode[0].nodeID]);
                var to = calcCenter($scope.pointsMap[$scope.selectedId]);
                ctx.beginPath();
                from && ctx.moveTo(+from.x, +from.y);
                to && ctx.lineTo(+to.x, +to.y);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#0066CC';
                ctx.stroke();
            }
        }

        $scope.findSelectedNode = function(node) {
            $scope.searchValue = null;
            $scope.selectedId = null;
            NodeSvc.findRootById(node.nodeID).then(function(node) {
                $scope.links = node.data.links;
                //root Node has been separated from it's neighbours
                $scope.rootNode = _.remove(node.data.nodes, function(el) {
                    return el.nodeID == node.data.root;
                });
                $scope.neighbourNodes = node.data.nodes;
            });
        };

        $scope.selectedNode = function(node) {
            $scope.selectedId = node.nodeID;
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
            ctx.css({
                'position': 'absalute',
                'z-index': '9999',
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


app.directive('gsShowNodeDitails', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(document).unbind("click");
            var url = attrs.gsImgUrl;
            var img_width = attrs.gsImgWidth;
            var img_height = +attrs.gsImgHeight;
            var width = +attrs.gsTitleWidth + 30.0 + +img_width;
            var txt = attrs.gsTxt;
            element.css({
                'width': width + 'px',
            });
            $('.gs-img').css({
                'width': img_width + 'px',
                'height': img_height + 'px',
                'background-image': 'url(' + url + ')',
                'background-size': 'cover'
            });
            $('.gs-body').append(txt);
            scope.setPoint(attrs.id, $(element), 'fromNaibour');
        }
    }
});

//Services
app.service('NodeSvc', function($http) {
    delete $http.defaults.headers.common['X-Requested-With'];
    var _url = 'http://ggg.instigate.am/api.php';

    this.findNode = function(val) {
        return $http({
            url: _url + '/nodes/search/' + val + '/lang/en',
            method: 'GET'
        });
    };

    this.findRootById = function(nodeId) {
        return $http({
            url: _url + '/map/root/' + nodeId + '/lang/en',
            method: 'GET'
        });

    };

});