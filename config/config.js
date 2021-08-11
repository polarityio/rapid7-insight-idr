module.exports = {
  name: 'Nexpose Insight IDR',
  acronym: 'NI-IDR',
  description:
    'The Polarity Nexpose Insight IDR Integration allows you to easily Query Emails, IP ' +
    'Addresses, Domains, and URLs in both Investigations, and Query Logs. You can also ' +
    'add Indicators to Threats, Close Investigations, and Assign Users to Investigations.',
  styles: ['./styles/styles.less'],
  entityTypes: ['IPv4', 'IPv6', 'email', 'domain', 'url'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'apiKey',
      name: 'Nexpose Insight IDR API Key',
      description:
        'Your API key for Nexpose Insight IDR. To see how to create a new API Key, you can ' +
        'check out Nexpose Documentation (https://docs.rapid7.com/insight/managing-platform-api-keys/). ' +
        'In order to Assign Users to Investigations, your API Key must have Organization ' +
        'Admin level or above permissions.  If your key is at the User level, Assigning Users to Investigations will be disabled.',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'regionCode',
      name: 'Nexpose Region Code',
      description:
        "The API Region Code that will be used to search Nexpose's API. To check your data " +
        'region, you can check out Nexpose Documentation (https://docs.rapid7.com/insight/navigate-the-insight-platform/#check-your-data-region).',
      default: {
        value: 'us',
        display: 'United States - 1'
      },
      type: 'select',
      options: [
        {
          value: 'us',
          display: 'United States - 1'
        },
        {
          value: 'us2',
          display: 'United States - 2'
        },
        {
          value: 'us3',
          display: 'United States - 3'
        },
        {
          value: 'eu',
          display: 'Europe'
        },
        {
          value: 'ca',
          display: 'Canada'
        },
        {
          value: 'au',
          display: 'Australia'
        },
        {
          value: 'ap',
          display: 'Japan'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'logQuery',
      name: 'Log Search Query',
      description:
        'The query you want to run when searching Nexpose Log Data. The query follows the ' +
        'LEQL querying format (https://docs.rapid7.com/insightidr/build-a-query/#log-entry-query-language-leql), ' +
        'and must contain the variable "{{ENTITY}}" in order for the search to be executed properly.  ' +
        'The variable represented by the string "{{ENTITY}}" will be replaced by the actual entity ' +
        "(i.e., an IP, hash, or email) that Polarity recognized on the user's screen. For " +
        'example, the default query is "where({{ENTITY}})" which searches for any place in ' +
        'the logs where the entity appears.',
      default: 'where({{ENTITY}})',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'logQueryTimeRange',
      name: 'Log Query Time Range',
      description:
        'The amount of time back you would like to see logs from. Supported values include: ' +
        '"yesterday", "today", and "last x timeunits" where x is the number of time unit ' +
        'back from the current server time. (Supported time units (case insensitive): ' +
        'min(s) or minute(s), hr(s) or hour(s), day(s), week(s), month(s), or year(s)).',
      default: 'last 1 year',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'threats',
      name: 'Threats To add Indicators To',
      description:
        'This is a comma separated list of Threats you will be able to add ' +
        'entities/indicators to.  The format to use is ' +
        '"Threat Name 1->threat-uuid-1, Threat Name 2->threat-uuid-2" (e.g. ' +
        '"MP Threat->832f42d1-9247-4e35-b521-f815d84e0df0, ..."). ' +
        'View Documentation for more details on how to get your Threat Key UUIDs. ' +
        '(https://docs.rapid7.com/insightidr/threats/) ' +
        'If left blank, adding an indicator/entities to threats will be disabled.',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
