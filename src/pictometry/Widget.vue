<template>
  <div id="pict-container"
       :class="this.pictContainerClass"
  >
    <div id="in-pict-div"
      @click="this.popoutClicked"
      >
      <i class="fa fa-external-link fa popout-icon"></i>
    </div>
    <!-- <div id="iframe-div"> -->
    <iframe
      id="pictometry-ipa"
      src="#"
      ref="pictometryIpa"
    />
    <!-- </div> -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    props: [
      'apiKey',
      'secretKey',
      'orientation',
    ],
    created() {
      this.$IFRAME_ID = 'pictometry-ipa';
    },
    mounted() {
      // fetch pictometry ipa script
      const scriptUrl = '//pol.pictometry.com/ipa/v1/embed/host.php' + '?apikey=' + this.apiKey;
      const self = this;
      $.getScript(scriptUrl, self.init);
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active;
      },
      pictContainerClass() {
        if (this.cyclomediaActive) {
          return 'large-8 columns mb-panel';
        } else {
          return 'large-24 columns mb-panel';
        }
      },
      center() {
        // return this.$store.state.geocode.data.geometry.coordinates;
        return this.$store.state.map.center;
      },
      zoomSentToPict() {
        // const mapZoom = this.$store.state.map.zoom;
        // let zoom;
        // if (this.cyclomediaActive) {
        //   zoom = mapZoom
        // } else {
        //   zoom = mapZoom + 1;
        // }
        // return zoom;
        return this.$store.state.map.zoom;
      },
    },
    watch: {
      center(nextCenter) {
        this.$ipa.setLocation({
          y: nextCenter.lat,
          x: nextCenter.lng,
          zoom: this.zoomSentToPict
        });
      },
      zoomSentToPict(nextZoom) {
        // console.log('watch zoomSentToPict', nextZoom);
        this.$ipa.setLocation({
          y: this.center.lat,
          x: this.center.lng,
          zoom: nextZoom
        });
      },
      cyclomediaActive(nextStatus) {
        if (nextStatus === true) {
          // console.log('pict: cyclo on');
          this.$ipa.showDashboard({
            zoom: false,
            imageFilter: false,
            layers: false,
            nextPrevious: false,
            tools: false,
            annotations: false,
            rotation: false,
            clearMeasurements: false,
            exportPdf: false,
            dualPane: false,
            imageDate: false,
            panTool: false,
            exportImage: false,
            areaTool: false,
            distanceTool: false,
            heightTool: false,
            locationTool: false,
            elevationTool: false,
            bearingTool: false,
            slopeTool: false,
            xyzTool: false,
            identifyPoint: false,
            identifyBox: false
          });
        } else {
          // console.log('pict: cyclo off');
          this.$ipa.showDashboard({
            zoom: true,
            imageFilter: true,
            layers: true,
            nextPrevious: true,
            tools: true,
            annotations: true,
            rotation: true,
            clearMeasurements: true,
            exportPdf: true,
            dualPane: true,
            imageDate: true,
            panTool: true,
            exportImage: true,
            areaTool: true,
            distanceTool: true,
            heightTool: true,
            locationTool: true,
            elevationTool: true,
            bearingTool: true,
            slopeTool: true,
            xyzTool: true,
            identifyPoint: true,
            identifyBox: true
          });
        }
      }
    },
    methods: {
      popoutClicked() {
        // console.log('popout clicked');
      },
      init() {
        // construct signed url
        const d = new Date();
        const t = Math.floor(d.getTime() / 1000);
        const unsignedUrl = 'http://pol.pictometry.com/ipa/v1/load.php' + "?apikey=" + this.apiKey + "&ts=" + t;
        const hash = md5(unsignedUrl, this.secretKey);
        const iframeId = this.$IFRAME_ID;
        const signedUrl = unsignedUrl + "&ds=" + hash + "&app_id=" + iframeId;

        // set the iframe src to load the IPA
        const iframe = this.$refs.pictometryIpa;
        // REVIEW can we bind this to a computed instead?
        iframe.setAttribute('src', signedUrl);

        // create pictometry host
        const ipa = this.$ipa = new PictometryHost(iframeId, 'http://pol.pictometry.com/ipa/v1/load.php');
        this.$store.commit('setPictometryIpa', ipa);
        ipa.ready = this.ipaReady;
      },
      ipaReady() {
        this.$ipa.setLocation({
          y: this.center.lat,
          x: this.center.lng,
          zoom: this.zoomSentToPict
        });

        const self = this;

        this.$ipa.addListener('onendzoom', function(zoom) {
          // console.log('widget: ipa detected zoom change to', zoom);
          self.$store.commit('setPictometryZoom', zoom.level);
        })
      },
    }, // end of methods


      //     didActivateTopic: function (topic) {
      //       console.log('didActivateTopic is firing with topic: ', topic);
      //       switch (topic) {
      //         case 'deeds':
      //           // turn on DOR Parcels
      //           ipa.showLayer({
      //             id: 114828,
      //             visible: true,
      //           })
      //           break;
      //         case 'zoning':
      //           // turn on zoning
      //           ipa.showLayer({
      //             id: 112230,
      //             visible: true,
      //           });
      //           break;
      //         case 'water':
      //           // turn on water Parcels
      //           ipa.showLayer({
      //             id: 108982,
      //             visible: true,
      //           })
      //           break;
      //
      //         default:
      //           // turn off DOR parcels
      //           ipa.showLayer({
      //             id: 113478,
      //             visible: false,
      //           });
      //           // turn off zoning
      //           ipa.showLayer({
      //             id: 112230,
      //             visible: false,
      //           });
      //       }
      //     },
      //
      //     didDeactivateTopic: function (topic) {
      //       switch (topic) {
      //         case 'deeds':
      //           // turn off DOR parcels
      //           ipa.showLayer({
      //             id: 114828,
      //             visible: false,
      //           });
      //           break;
      //
      //         case 'zoning':
      //           // turn on zoning
      //           ipa.showLayer({
      //             id: 112230,
      //             visible: false,
      //           });
      //           break;
      //
      //         case 'water':
      //           // turn off water
      //           ipa.showLayer({
      //             id: 108982,
      //             visible: false,
      //           })
      //
      //         default:
      //           // turn off DOR parcels
      //           ipa.showLayer({
      //             id: 113478,
      //             visible: false,
      //           });
      //           // turn off zoning
      //           ipa.showLayer({
      //             id: 112230,
      //             visible: false,
      //           });
      //       }
      //     },
      //
      //     shapeIds : [],
      //     circleIds : [],
      //     cameraIds : [],
      //
      //
      //    }//end of return
      // })();


  }; // end of export

</script>


<style scoped>


header.site-header > .row:last-of-type {
  background: #2176d2;
}

#in-pict-div {
  /*float: right;*/
  position: absolute;
  top: 0px;
  right: 0px;
  /*z-index: 2000000;*/
  background-color: white;
  border: 0px solid;
  width: 30px;
  height: 30px;
  /*display:none;*/
  cursor:pointer;
  /*position: relative;
  top: 0px;
  right: 0px;*/
}

#pict-container {
  padding: 0px;
  height: 50%;
  position: relative;
}

/*#iframe-div {
}*/

#pictometry-ipa {
  height: 100%;
  width: 100%;
  border: 0px;
}

#search-container {
    float: right;
}

#search-input {
    float: left;
    width: 400px;
}

#search-button {
    height: 2.78571rem;
}

#data-panel {
    background: #fff;
    padding-left: 12px;
    padding-right: 12px;
    height: 100%;
}

#data-panel > h1 {
    color: #666;
}

#data-row-list > a {
    background: #f5f5f5;
    border: 1px solid #ddd;
    display: block;
    font-size: 18px;
    font-weight: normal;
    height: 70px;
    line-height: 45px;
    /*margin-left: 10px;*/
    /*margin-right: 10px;*/
    padding: 10px;
    /*vertical-align: middle;*/
    /*text-align: middle;*/
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    margin-bottom: 8px;
}

#data-row-list > a:hover {
    background: #fff;
    color: inherit;
}

#data-row-list .data-row-link-icon {
    padding-right: 30px;
}

.data-row {
    padding: 10px;
    margin-bottom: 10px;
    display: none;
}

.data-row table th, .data-row table td {
    font-size: 15px;
}

.data-row table tr th {
    text-align: left;
    vertical-align: top;
}

#map {
    height: 100%;
}

ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

img { max-width: inherit; }


</style>
