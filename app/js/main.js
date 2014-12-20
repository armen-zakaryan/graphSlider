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

        function calcCenter(el, isRoot) {
            var offset = el.offset();
            var element = {};
            element.height = el.height();
            element.width = el.width();
            element.x = offset.left + el.width() / 2;
            if (isRoot) {
                element.y = offset.top + el.height() + 25;
            } else {
                element.y = offset.top + el.height() / 2;
            }
            return element;
        }

        function calcTextPosition(root, neighbour) {
            var tan = (neighbour.x - root.x) / (neighbour.y + root.y);
            var _y = (neighbour.y - root.y - neighbour.height / 2) / 2;
            var _x = _y * tan;
            return {
                x: root.x + _x,
                y: root.y + _y
            }
        }
        $scope.setPoint = function(nodeNumber, element, fromNaibour) {
            if (fromNaibour && $scope.rootNode[0].nodeID === $scope.selectedId) {
                $scope.draw();
                return;
            }
            $scope.pointsMap[nodeNumber] = element;
            $scope.draw();
        };
        $scope.draw = function(_ctx) {
            ctx = _ctx || ctx;
            $scope.resetCanvas();
            if ($scope.selectedId) {
                var from = calcCenter($scope.pointsMap[$scope.rootNode[0].nodeID], 'root');
                var to = calcCenter($scope.pointsMap[$scope.selectedId]);
                ctx.beginPath();
                from && ctx.moveTo(+from.x, +from.y);
                to && ctx.lineTo(+to.x, +to.y);

                ctx.lineWidth = 1;
                ctx.strokeStyle = '#0066CC';
                ctx.stroke();

                var textPossition = calcTextPosition(from, to);
                ctx.font = "12px Arial";
                var text = "relation";
                ctx.fillText(text, textPossition.x - text.length / 2, textPossition.y);
            }
        };

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
        var i = 0;
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

            $(window).bind('resize', function(e) {
                window.resizeEvt;
                $(window).resize(function() {
                    clearTimeout(window.resizeEvt);
                    window.resizeEvt = setTimeout(function() {
                        var canvas = $('canvas');
                        canvas.width(window.innerWidth);
                        canvas.height(window.innerHeight);
                        scope.draw();
                    }, 250);
                });
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


app.directive('gsShowNodeDitails', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(document).unbind("click");
            var url = attrs.gsImgUrl || 'app/img/default.jpg';
            console.log(attrs.gsImgUrl, url);
            var txt = attrs.gsTxt;
            $('.gs-img').css({
                'background-image': 'url(' + url + ')',
                'background-size': 'cover'
            });
            $('.gs-body').append(txt);
            $timeout(function() {
                scope.setPoint(attrs.id, $(element), 'fromNaibour');
            });
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
            url: _url + '/rels/root/' + nodeId + '/lang/en',
            method: 'GET'
        });

    };
});