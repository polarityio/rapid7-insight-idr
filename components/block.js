'use strict';

polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  logs: Ember.computed.alias('details.foundQueryLogs.events'),
  statistics: Ember.computed.alias('details.foundQueryLogs.statistics'),
  stats: Ember.computed.alias('statistics.stats'),
  formattedGroupStats: Ember.computed.alias('details.foundQueryLogs.formattedGroupStats'),
  query: Ember.computed.alias('details.foundQueryLogs.query'),
  searchLink: Ember.computed.alias('details.foundQueryLogs.link'),
  showFieldsTab: Ember.computed('block.userOptions.displayFields.length', function () {
    return this.get('block.userOptions.displayFields.length') > 0;
  }),
  hasStats: Ember.computed('statistics.stats', function () {
    const stats = this.get('statistics.stats');
    if (stats) {
      return Object.keys(stats).length > 0;
    } else {
      return false;
    }
  }),
  statIcon: Ember.computed('statistics.type', function () {
    switch (this.get('statistics.type')) {
      case 'max':
        return 'arrow-alt-up';
      case 'min':
        return 'arrow-alt-down';
      case 'average':
        return 'tachometer-average';
      case 'count':
        return 'tally';
      case 'unique':
        return 'fingerprint';
      case 'sum':
        return 'sigma';
      case 'bytes':
        return 'database';
    }
  }),
  hadHighlightLoadingError: false,
  loadingHighlights: false,
  init() {
    this._super(...arguments);

    this.initHighlights();

    if (!this.get('block._state')) {
      this.set('block._state', {});
    }
  },
  actions: {
    showTable: function (index) {
      this.set('logs.' + index + '.showTable', true);
      this.set('logs.' + index + '.showJson', false);
      this.set('logs.' + index + '.showFields', false);
    },
    showJson: function (index) {
      this.initJsonTab(index);
    },
    showFields: function (index) {
      this.set('logs.' + index + '.showTable', false);
      this.set('logs.' + index + '.showJson', false);
      this.set('logs.' + index + '.showFields', true);
    },
    toggleTabs: function (index) {
      this.toggleProperty('logs.' + index + '.showTabs', false);
    }
  },
  initJsonTab: function (index) {
    if (typeof this.get('logs.' + index + '.json') === 'undefined') {
      this.set(
        'logs.' + index + '.json',
        this.syntaxHighlight(
          JSON.stringify(this.get('logs.' + index + '.message'), null, 4)
        )
      );
    }
    this.set('logs.' + index + '.showTable', false);
    this.set('logs.' + index + '.showJson', true);
    this.set('logs.' + index + '.showFields', false);
  },
  syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  },
  initHighlights() {
    this.get('logs').forEach((log, index) => {
      if (this.get('showFieldsTab')) {
        this.set('logs.' + index + '.showTable', false);
        this.set('logs.' + index + '.showJson', false);
        this.set('logs.' + index + '.showFields', true);
      } else {
        this.initJsonTab(index);
      }
    });
  }
});
