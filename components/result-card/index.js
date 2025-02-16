Component({
  properties: {
    result: {
      type: Object,
      value: null
    }
  },

  methods: {
    handleViewDetail() {
      this.triggerEvent('viewDetail');
    }
  }
});
