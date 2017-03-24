<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_ :zoomControlPosition="'bottomright'">
      <!-- controls -->
      <SearchControl :position="'topleft'" />

      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config.map.basemaps"
                         v-if="activeBasemap === key"
                         :key="key"
                         :url="basemap.url"
      />
      <DorParcels />
    </Map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import SearchControl from './SearchControl';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';
  import DorParcels from '../esri-leaflet/DorParcels';

  export default {
    components: {
      Map_,
      SearchControl,
      EsriTiledMapLayer,
      DorParcels
    },
    computed: {
      activeBasemap() {
        return this.activeTopicConfig.basemap;
      },
      activeTopicConfig() {
        const key = this.$store.state.topic;
        return this.$config.topics.filter((topic) => {
          return topic.key === key;
        })[0];
      }
    }
  };
</script>
