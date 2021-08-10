polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  expandableTitleStates: {
    targets: {},
    logs: {}
  },
  activeTab: 'logs',
  threatKeyToAddIndicatorTo: '',
  indicatorMessage: '',
  isIndicatorRunning: false,
  indicatorErrorMessage: '',
  init() {
    console.log({
      threats: this.get('block.details.threats'),
      threats2: this.get('details.threats'),
      type: this.get('block.entity.type')
    });
    this.set('expandableTitleStates', { targets: {}, logs: {} });

    this.set(
      'activeTab',
      this.get('details.foundQueryLogs.length')
        ? 'logs'
        : this.get('details.foundInvestigations.length')
        ? 'investigations'
        : 'threats'
    );
    if(this.get('details.threats')){
      this.set(
        'threatKeyToAddIndicatorTo',
        Object.entries(this.get('details.threats'))[0][1]
      );
    }

    this.get('block').notifyPropertyChange('data');

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    },
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
    },
    addIndicatorToThreat: function () {
      const outerThis = this;

      this.set('indicatorMessage', '');
      this.set('isIndicatorRunning', true);
      this.get('block').notifyPropertyChange('data');

      this.sendIntegrationMessage({
        action: 'addIndicatorToThreat',
        data: {
          entity: this.block.entity,
          threatKeyToAddIndicatorTo: this.get('threatKeyToAddIndicatorTo')
        }
      })
        .then(() => {
          outerThis.set('indicatorMessage', 'Successfully Add Indicator to Threat');
        })
        .catch((err) => {
          outerThis.set(
            'indicatorErrorMessage',
            `Failed: ${err.detail || err.message || err.title || 'Unknown Reason'}`
          );
        })
        .finally(() => {
          outerThis.set('isIndicatorRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('indicatorMessage', '');
            outerThis.set('indicatorErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  }
});
