<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  //const parcelQuery = L.esri.query({url: this.$config.map.queryLayers.dor.url});
  var parcelQuery = L.esri.query({url:'//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/24'});
  parcelQuery.where("MAPREG = 014S090031")
  parcelQuery.run(this.test);

  export default {
    // props: [
    //   'url'
    // ],
    mounted() {
      // const leafletElement = this.$leafletElement = this.createLeafletElement();
      // const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      // if (map) {
      //   leafletElement.addTo(map);
      // }
    },
    // destroyed() {
    //   this.$leafletElement._map.removeLayer(this.$leafletElement);
    // },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      // createLeafletElement() {
      //   return parcelQuery({
      //     //url: this.url
      //   });
      // },
      test() {
        console.log('test')
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        //this.$leafletElement.addTo(map);
      }
    }
  };
</script>
