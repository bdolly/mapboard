<template>
  <div>
    <a class="button" href="#" v-for="item in items" :data-key="keyForItem(item)"
              @click="handleClick"
              :class="{'hollow': !isActive(item)}">
      {{ keyForItem(item) }}
    </a>
  </div>
</template>


<script>
  import TopicComponent from './TopicComponent';

  export default {
    mixins: [TopicComponent],
    computed: {
      items() {
        return this.evaluateSlot(this.slots.items);
      },
    },
    methods: {
      isActive(item) {
        const imageOverlay = this.$store.state.map.imageOverlay;
        const itemKey = this.keyForItem(item);
        return imageOverlay === itemKey;
      },
      keyForItem(item) {
        const getKeyFn = this.options.getKey;
        return getKeyFn(item);
      },
      handleClick(e) {
        const prevImageOverlay = this.$store.state.map.imageOverlay;
        const nextImageOverlay = e.target.getAttribute('data-key');
        // console.log(nextImageOverlay);
        if (prevImageOverlay === nextImageOverlay) {
          this.$store.commit('setImageOverlay', null);
        } else {
          this.$store.commit('setImageOverlay', nextImageOverlay);
        }
      },
    }
  };
</script>

<style>

.button {
  margin-left: 5px;
  margin-right: 5px;
  margin-top: 0px;
  margin-bottom: 0px;
}

</style>
