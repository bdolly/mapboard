<template>
  <div class="large-12 columns mb-panel mb-panel-topics" id="topic-panel">
    <div class="row">
    <!-- <div class="row" :class="{ 'row-with-widget': this.$store.state.pictometry.active }"> -->
      <!-- before search -->
      <greeting v-show="!geocode" />

      <!-- after search -->
      <div v-if="geocode">
        <div class="address-header" v-if="address">
          <h1 class="address-header-line-1">{{ address }}</h1>
          <div class="address-header-line-2 small-text">PHILADELPHIA, PA {{ zipCode }}</div>
        </div>
        <topic v-for="topic in this.$config.topics"
               :topicKey="topic.key"
               :key="topic.key"
        />
      </div>
    </div>
    <!-- <slot name="pictWidget" /> -->
  </div>
</template>

<script>
  import Greeting from './Greeting';
  import Topic from './Topic';

  export default {
    components: {
      Greeting,
      Topic
    },
    methods: {
      shouldShowTopic(topic) {
        const requiredSources = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredSources.length === 0) {
          return true;
        }

        const sources = this.$store.state.sources;
        return requiredSources.every(key => sources[key].data)
      }
    },
    computed: {
      geocode() {
        return this.$store.state.geocode.data;
      },
      address() {
        const geocode = this.geocode;
        if (!geocode) return null;
        return geocode.properties.street_address;
      },
      zipCode() {
        const geocode = this.geocode;
        if (!geocode) return null;
        const zipCode = geocode.properties.zip_code;
        const zip4 = geocode.properties.zip_4;
        const parts = [zipCode];
        if (zip4) parts.push(zip4);
        return parts.join('-');
      }
    }
  };
</script>

<style>
  .mb-panel-topics {
    background: #fff;
    padding-left: 20px !important;
    padding-right: 20px !important;
    overflow-y: auto;
  }

  /*TODO use patterns*/
  .address-header {
    color: #666;
    border-left: 5px solid #58c04d;
    margin-left: 10px;
    padding-left: 15px;
    margin-bottom: 25px;
  }

  .address-header-line-1 {
    margin-bottom: 0;
  }
</style>
