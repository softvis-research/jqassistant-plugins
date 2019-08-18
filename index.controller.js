angular.module('softvisApp').controller('indexController', ['$scope', '$http', '$q',
    function ($scope, $http, $q) {

        $http.get('data/jqassistant-catalog.json').then(function (response) {
            console.log(response.data);

            var data = response.data;

            $scope.maintainers = _.values(data.maintainers);

            $scope.plugins = resolvePlugins(data.plugins, data.maintainers);
            $scope.filteredPlugins = angular.copy($scope.plugins);

            $scope.tags = resolveTags(data.plugins);

        });

        $scope.loadTags = function (query) {

            query = query.toLowerCase();

            return _.filter($scope.tags, function (tag) {
                return tag.text.toLowerCase().indexOf(query) !== -1;
            });
        };

        $scope.$watch('selectedTags', function (newValue, oldValue) {

            if (!newValue || newValue.length === 0) {
                $scope.filteredPlugins = $scope.plugins;
                return;
            }

            var tags = _.map(newValue, function (tagWrapper) {
                return tagWrapper.text;
            });

            var projects = angular.copy($scope.plugins);

            $scope.filteredPlugins = _.filter(projects, function (project) {

                var plugins = _.filter(project.entries, function(plugin) {
                    return _.intersection(plugin.tags, tags).length === tags.length;
                });

                project.entries = plugins;

                return plugins.length > 0;
            });
        }, true);

        function resolvePlugins(projects, maintainers) {

            for (var p = 0; p < projects.length; p++) {
                for (var i = 0; i < projects[p].entries.length; i++) {

                    var maintainerKey = projects[p].entries[i].maintainedBy;
                    projects[p].entries[i].maintainedBy = maintainers[maintainerKey];
                }
            }
            return projects;
        }

        function resolveTags(projects) {

            var tags = [];

            for (var p = 0; p < projects.length; p++) {
                for (var i = 0; i < projects[p].entries.length; i++) {

                    tags = _.concat(tags, projects[p].entries[i].tags);
                }
            }

            var sortedUniqueTags = _.sortBy(_.uniq(tags));

            return _.map(sortedUniqueTags, function (tag) {
                return {
                    text: tag
                }
            });
        }


    }]);