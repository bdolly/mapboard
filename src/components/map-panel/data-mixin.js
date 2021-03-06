export default {
  methods: {
    // this should be called after a successful geocode to reset the data
    // source data in state
    resetData() {
      const dataSources = this.$config.dataSources || {};

      for (let dataSourceKey of Object.keys(dataSources)) {
        const dataSource = dataSources[dataSourceKey];
        const targetsDef = dataSource.targets;

        // null out existing data in state
        if (targetsDef) {
          this.$store.commit('clearSourceTargets', {
            key: dataSourceKey
          });
        } else {
          this.$store.commit('setSourceData', {
            key: dataSourceKey,
            data: null
          })
          this.$store.commit('setSourceStatus', {
            key: dataSourceKey,
            status: null
          })
        }
      }
    },
    checkDataSourcesFetched(paths = []) {
      const state = this.$store.state;

      return paths.every(path => {
        // deps can be deep keys, e.g. `dor.parcels`. split on periods to get
        // a sequence of keys.
        const pathKeys = path.split('.');

        // TODO/TEMP restructure state so parcels and geocode live in
        // state.sources? the following targets the dorDocuments data source.
        const isDataSource = !(pathKeys.length === 1 && pathKeys[0] === 'dorParcels');
        const parentObj = isDataSource ? state.sources : state;

        // traverse state to get the parent of the data object we need to
        // check.
        let stateObj = pathKeys.reduce((acc, pathKey) => {
          return acc[pathKey];
        }, parentObj);

        if (isDataSource) {
          return stateObj.status === 'success';
        } else {
          return !!stateObj;
        }
      });
    },
    checkDataSourceReady(key, options, targetId) {
      // console.log(`check data source ready: ${key} ${targetId || ''}`);

      const deps = options.deps;
      const depsMet = this.checkDataSourcesFetched(deps);
      let isReady = false;

      // if data deps have been met
      if (depsMet) {
        // get the target obj
        let targetObj = this.$store.state.sources[key];
        if (targetId) {
          targetObj = targetObj.targets[targetId];
        }

        // if the target obj has a status of null, this data source is ready.
        isReady = !targetObj.status;
      }

      return isReady;
    },
    fetchData() {
      // console.log('\nFETCH DATA');
      // console.log('-----------');

      const geocodeObj = this.$store.state.geocode.data;

      // we always need a good geocode before we can get data, so return
      // if we don't have one yet.
      if (!geocodeObj) {
        // console.log('fetch data but no geocode yet, returning');
        return;
      }

      const dataSources = this.$config.dataSources || {};

      // get "ready" data sources (ones whose deps have been met)
      for (let [dataSourceKey, dataSource] of Object.entries(dataSources)) {
        const state = this.$store.state;
        const type = dataSource.type;
        const targetsDef = dataSource.targets;

        // console.log('key:', dataSourceKey)

        // if the data sources specifies a features getter, use that to source
        // features for evaluating params/forming requests. otherwise,
        // default to the geocode result.
        let targets;
        let targetIdFn;
        let targetsFn;

        if (targetsDef) {
          targetsFn = targetsDef.get;
          targetIdFn = targetsDef.getTargetId;

          if (typeof targetsFn !== 'function') {
            throw new Error(`Invalid targets getter for data source '${dataSourceKey}'`);
          }
          targets = targetsFn(state);

          // check if target objs exist in state.
          const targetIds = targets.map(targetIdFn);
          const stateTargets = state.sources[dataSourceKey].targets;
          const stateTargetIds = Object.keys(stateTargets);
          // the inclusion check wasn't working because ids were strings in
          // one set and ints in another, so do this.
          const stateTargetIdsStr = stateTargetIds.map(String);
          const shouldCreateTargets = !targetIds.every(targetId => {
            const targetIdStr = String(targetId);
            return stateTargetIdsStr.includes(targetIdStr);
          });

          // if not, create them.
          if (shouldCreateTargets) {
            // console.log('should create targets', targetIds, stateTargetIds);
            this.$store.commit('createEmptySourceTargets', {
              key: dataSourceKey,
              targetIds
            });
          }

          if (!Array.isArray(targets)) {
            throw new Error('Data source targets getter should return an array');
          }
        } else {
          targets = [geocodeObj];
        }

        for (let target of targets) {
          // get id of target
          let targetId;
          if (targetIdFn) {
            targetId = targetIdFn(target);
          }

          // targetId && console.log('target:', targetId);

          // check if it's ready
          const isReady = this.checkDataSourceReady(dataSourceKey, dataSource, targetId);
          if (!isReady) {
            // console.log('not ready');
            continue;
          }

          // update status to `waiting`
          const setSourceStatusOpts = {
            key: dataSourceKey,
            status: 'waiting'
          };
          if (targetId) {
            setSourceStatusOpts.targetId = targetId;
          }
          this.$store.commit('setSourceStatus', setSourceStatusOpts);

          // TODO do this for all targets
          switch(type) {
            case 'http-get':
              this.fetchHttpGet(target, dataSource, dataSourceKey, targetIdFn);
              break;
            case 'carto':
              this.fetchCarto(target, dataSource, dataSourceKey, targetIdFn);
              break;
            case 'esri':
              // TODO add targets id fn
              this.fetchEsri(target, dataSource, dataSourceKey);
              break;
            case 'esri-nearby':
              // TODO add targets id fn
              this.fetchEsriNearby(target, dataSource, dataSourceKey);
              break;
            default:
              throw `Unknown data source type: ${type}`;
              break;
          }
        }
      }
    },
    assignFeatureIds(features, dataSourceKey, topicId) {
      const featuresWithIds = [];

      // REVIEW this was not working with Array.map for some reason
      // it was returning an object when fetchJson was used
      // that is now converted to an array in fetchJson
      for (let i = 0; i < features.length; i++) {
        const suffix = (topicId ? topicId + '-' : '') + i;
        const id = `feat-${dataSourceKey}-${suffix}`;
        const feature = features[i];
        // console.log(dataSourceKey, feature);
        try {
          feature._featureId = id;
        }
        catch (e) {
          console.warn(e);
        }
        featuresWithIds.push(feature);
      }

      // console.log(dataSourceKey, features, featuresWithIds);
      return featuresWithIds;
    },
    didFetchData(key, status, data, targetId) {
      // console.log('DID FETCH DATA:', key, targetId || '', data);

      const dataOrNull = status === 'error' ? null : data;
      let stateData = dataOrNull;

      // if this is an array, assign feature ids
      if (Array.isArray(stateData)) {
        stateData = this.assignFeatureIds(stateData, key, targetId);
      }

      // does this data source have targets?
      // const targets = this.$config.dataSources[key].targets;

      // put data in state
      const setSourceDataOpts = {
        key,
        data: stateData,
      };
      const setSourceStatusOpts = {
        key,
        status
      };
      if (targetId) {
        setSourceDataOpts.targetId = targetId;
        setSourceStatusOpts.targetId = targetId;
      }

      // commit
      this.$store.commit('setSourceData', setSourceDataOpts);
      this.$store.commit('setSourceStatus', setSourceStatusOpts);

      // try fetching more data
      this.fetchData();
    },
    evaluateParams(feature, dataSource) {
      const params = {};
      const paramEntries = Object.entries(dataSource.options.params);
      const state = this.$store.state;

      for (let [key, valOrGetter] of paramEntries) {
        let val;

        if (typeof valOrGetter === 'function') {
          val = valOrGetter(feature, state);
        } else {
          val = valOrGetter;
        }

        params[key] = val;
      }

      return params;
    },
    fetchCarto(feature, dataSource, dataSourceKey, targetIdFn) {
      const options = dataSource.options;
      const successFn = options.success;

      // if no success callback is passed in, default to unpacking carto rows
      if (!successFn) {
        options.success = data => data.rows;
      }

      // proxy to fetchHttpGet
      this.fetchHttpGet(feature, dataSource, dataSourceKey, targetIdFn);
    },
    fetchHttpGet(feature, dataSource, dataSourceKey, targetIdFn) {
      const params = this.evaluateParams(feature, dataSource);
      const url = dataSource.url;
      const options = dataSource.options;
      const successFn = options.success;
      // if the data is not dependent on other data
      this.$http.get(url, { params }).then(response => {
        // call success fn
        let data = response.body;
        if (successFn) {
          data = successFn(data);
        }

        // get target id, if there should be one
        let targetId;
        if (targetIdFn) {
          targetId = targetIdFn(feature);
        }

        this.didFetchData(dataSourceKey, 'success', data, targetId);
      }, response => {
        console.log('fetch json error', response);
        this.didFetchData(dataSourceKey, 'error');
      });
    },
    fetchEsriSpatialQuery(dataSourceKey, url, relationship, targetGeom) {
      // console.log('fetch esri spatial query');

      const query = L.esri.query({url})[relationship](targetGeom);

      query.run((error, featureCollection, response) => {
        // console.log('did get esri spatial query', response, error);

        const data = featureCollection.features;
        const status = error ? 'error' : 'success';
        this.didFetchData(dataSourceKey, status, data);
      });
    },
    fetchEsri(feature, dataSource, dataSourceKey) {
      const options = dataSource.options;
      const url = dataSource.url;
      const relationship = options.relationship;
      const geom = feature.geometry;

      this.fetchEsriSpatialQuery(dataSourceKey, url, relationship, geom);
    },
    fetchEsriNearby(feature, dataSource, dataSourceKey) {
      // console.log('fetch esri nearby', feature);

      //const params = this.evaluateParams(feature, dataSource);
      // const url = dataSource.url;
      const {options} = dataSource;
      const dataSourceUrl = dataSource.url;
      const {geometryServerUrl} = options;

      // params.geometries = `[${feature.geometry.coordinates.join(', ')}]`
      // TODO get some of these values from map, etc.
      const params = {
        // geometries: feature => '[' + feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1] + ']',
        geometries: `[${feature.geometry.coordinates.join(', ')}]`,
        inSR: () => 4326,
        outSR: () => 4326,
        bufferSR: () => 4326,
        distances: () => .0015,
        unionResults: () => true,
        geodesic: () => false,
        f: () => 'json',
      };
      // console.debug('esri nearby params', params);

      // get buffer polygon
      const bufferUrl = geometryServerUrl.replace(/\/$/, '') + '/buffer';
      // console.log('im getting the points', bufferUrl);

      this.$http.get(bufferUrl, {params}).then(response => {
        // console.log('did get esri nearby buffer', response);
        const data = response.body;

        const xyCoords = data['geometries'][0]['rings'][0];
        const latLngCoords = xyCoords.map(xyCoord => [...xyCoord].reverse());

        // get nearby features using buffer
        const buffer = L.polygon(latLngCoords);
        this.fetchEsriSpatialQuery(dataSourceKey,
                                   dataSourceUrl,
                                   'within',
                                   buffer
        );
      }, response => {
        // console.log('did fetch esri nearby error', response);
        this.didFetchData(dataSource, 'error');
      });
    }, // end of fetchEsriNearby
  }
};
