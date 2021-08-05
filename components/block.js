
polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  expandableTitleStates: {
    logsExpanded: { 0: false },
    targets: {},
    logs: {},
    investigationsExpanded: { 0: false }
  },
  init() {
    this.set('expandableTitleStates', {
      logsExpanded: { 0: false },
      targets: {},
      logs: {},
      investigationsExpanded: { 0: false }
    });

    if (
      this.get('details.foundQueryLogs.length') &&
      this.get('details.foundQueryLogs.length') <= 2
    ) {
      this.set('expandableTitleStates.logsExpanded.0', true);
    }
    if (
      this.get('details.foundInvestigations.length') &&
      this.get('details.foundInvestigations.length') <= 2
    ) {
      this.set('expandableTitleStates.investigationsExpanded.0', true);
    }

    this.get('block').notifyPropertyChange('data');

    this._super(...arguments);
  },
  actions: {
    toggleExpandableTitle: function (titleName, index) {
      const modifiedExpandableTitleStates = Object.assign(
        {},
        this.get('expandableTitleStates'),
        {
          [titleName]: Object.assign({}, this.get(`expandableTitleStates.${titleName}`), {
            [index]: !this.get(`expandableTitleStates.${titleName}.${index}`)
          })
        }
      );
      console.log({ titleName, index, modifiedExpandableTitleStates });

      this.set(`expandableTitleStates`, modifiedExpandableTitleStates);
      this.get('block').notifyPropertyChange('data');
    }
  }
});
