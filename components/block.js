polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  expandableTitleStates: { targets: {}, logs: {} },
  activeTab: 'logs',
  threatKeyToAddIndicatorTo: '',
  selectedUser: {},
  indicatorMessage: '',
  indicatorErrorMessage: '',
  isIndicatorRunning: false,
  closeInvestigationMessage: {},
  closeInvestigationErrorMessage: {},
  isCloseInvestigationRunning: false,
  assignMessage: {},
  assignErrorMessage: {},
  isAssignRunning: false,
  init() {
    this.set('expandableTitleStates', { targets: {}, logs: {} });

    this.set(
      'activeTab',
      this.get('details.foundQueryLogs.length')
        ? 'logs'
        : this.get('details.foundInvestigations.length')
        ? 'investigations'
        : 'threats'
    );
    if (this.get('details.threats')) {
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
    },
    closeInvestigation: function (investigationId) {
      const outerThis = this;
      const currentInvestigations = outerThis.get('details.foundInvestigations');
      const indexOfInvestigation = currentInvestigations
        .map(({ id }) => id)
        .indexOf(investigationId);

      this.set(`closeInvestigationMessage.${indexOfInvestigation}`, '');
      this.set('isCloseInvestigationRunning', true);
      this.get('block').notifyPropertyChange('data');

      this.sendIntegrationMessage({
        action: 'closeInvestigation',
        data: {
          investigationId
        }
      })
        .then(() => {
          const newInvestigations = [
            ...currentInvestigations.slice(0, indexOfInvestigation),
            Object.assign({}, currentInvestigations[indexOfInvestigation], {
              status: 'CLOSE'
            }),
            ...currentInvestigations.slice(
              indexOfInvestigation + 1,
              currentInvestigations.length
            )
          ];

          outerThis.set('details.foundInvestigations', newInvestigations);
          outerThis.set(
            `closeInvestigationMessage.${indexOfInvestigation}`,
            'Successfully Closed Investigation'
          );
        })
        .catch((err) => {
          outerThis.set(
            `closeInvestigationErrorMessage.${indexOfInvestigation}`,
            `Failed: ${err.detail || err.message || err.title || 'Unknown Reason'}`
          );
        })
        .finally(() => {
          outerThis.set('isCloseInvestigationRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set(`closeInvestigationMessage.${indexOfInvestigation}`, '');
            outerThis.set(`closeInvestigationErrorMessage.${indexOfInvestigation}`, '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    editSelectedUser: function (investigationIndex, e) {
      const selectedUserId = e.target.value;
      this.set(`selectedUser.${investigationIndex}`, selectedUserId);
      this.get('block').notifyPropertyChange('data');
    },
    assignUserToInvestigation: function (investigationId) {
      const outerThis = this;
      const currentInvestigations = outerThis.get('details.foundInvestigations');
      const indexOfInvestigation = currentInvestigations
        .map(({ id }) => id)
        .indexOf(investigationId);

      if (!this.get(`selectedUser.${indexOfInvestigation}`)) {
        outerThis.set(
          `assignErrorMessage.${indexOfInvestigation}`,
          'Must Select a User To Assign'
        );

        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set(`assignErrorMessage.${indexOfInvestigation}`, '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
      }
      this.set(`assignMessage.${indexOfInvestigation}`, '');
      this.set('isAssignRunning', true);
      this.get('block').notifyPropertyChange('data');

      const selectedUser = this.get(`selectedUser.${indexOfInvestigation}`);
      const email = this.get('details.users').find(
        (user) => user.id === selectedUser
      ).email;
      this.sendIntegrationMessage({
        action: 'assignUserToInvestigation',
        data: {
          investigationId,
          email
        }
      })
        .then(({ newInvestigation }) => {
          const newInvestigations = [
            ...currentInvestigations.slice(0, indexOfInvestigation),
            Object.assign(
              {},
              currentInvestigations[indexOfInvestigation],
              newInvestigation
            ),
            ...currentInvestigations.slice(
              indexOfInvestigation + 1,
              currentInvestigations.length
            )
          ];

          outerThis.set('details.foundInvestigations', newInvestigations);
          outerThis.set(
            `assignMessage.${indexOfInvestigation}`,
            'Successfully Assigned User To Investigation'
          );
        })
        .catch((err) => {
          outerThis.set(
            `assignErrorMessage.${indexOfInvestigation}`,
            `Failed: ${err.detail || err.message || err.title || 'Unknown Reason'}`
          );
        })
        .finally(() => {
          outerThis.set('isAssignRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set(`assignMessage.${indexOfInvestigation}`, '');
            outerThis.set(`assignErrorMessage.${indexOfInvestigation}`, '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  }
});
