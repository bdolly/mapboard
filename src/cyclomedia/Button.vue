<template>
  <div class="leaflet-bar easy-button-container leaflet-control">
    <button :class="this.cyclomediaActive"
            @click.prevent="handleButtonClick"
    >
      <span class="button-state">
        <img class="button-image" :src="imgSrc">
      </span>
    </button>
  </div>
</template>

<script>
  import Control from '../leaflet/Control';
  import CyclomediaRecordingsClient from './recordings-client';

  export default {
    extends: Control,
    // TODO figure how to extend props. sometimes it's an obj, sometimes an array.
    // props: Object.assign(props, {
    // }),
    props: [
      'link',
      'imgSrc'
    ],
    created() {
      // create cyclomedia recordings client
      this.$cyclomediaRecordingsClient = new CyclomediaRecordingsClient(
        this.$config.cyclomedia.recordingsUrl,
        this.$config.cyclomedia.username,
        this.$config.cyclomedia.password,
        4326
      );
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active ? 'active' : 'inactive'
      }
    },
    methods: {
      handleButtonClick(e) {
        const willBeActive = !this.$store.state.cyclomedia.active;

        this.$store.commit('setCyclomediaActive', willBeActive);

        // if the cyclo viewer is off screen when it loads imagery, it won't
        // show anything even once it's on screen. use this to trigger an
        // update.
        const viewer = this.$store.state.cyclomedia.viewer;

        if (willBeActive && viewer) {
          this.$nextTick(() => {
            viewer.forceUpdate();
          });
        }

        this.$emit('click');
      },
      // setNewLocation(latlng) {
      //   const viewer = this.$store.state.cyclomedia.viewer;
      //   const xy = [latlng.lng, latlng.lat];
      //   viewer.openByCoordinate(xy);
      // },
    }
  };
</script>

<style scoped>

  .inactive {
    background-color: #ffffff;
  }
  .inactive:hover {
    background-color: #ffffff;
  }
  .active {
    background-color: rgb(243, 198, 19);
  }
  .active:hover {
    background-color: rgb(243, 198, 19);
  }

</style>
