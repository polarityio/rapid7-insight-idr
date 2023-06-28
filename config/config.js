module.exports = {
  name: 'Rapid7 Insight IDR',
  acronym: 'R7-IDR',
  description:
    'The Polarity Rapid7 Insight IDR Integration allows you to easily query Emails, IP ' +
    'Addresses, Domains, and URLs in Logs.',
  styles: ['./styles/styles.less'],
  entityTypes: ['IPv4', 'IPv6', 'email', 'domain', 'url', 'hash'],
  // customTypes: [
  //   {
  //     key: 'hostname',
  //     regex: /windows-[a-z0-9]{7}/
  //   }
  // ],
  defaultColor: 'light-purple',
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
    proxy: ""
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'apiKey',
      name: 'Rapid7 Insight IDR API Key',
      description:
        'Your API key for Rapid7 Insight IDR. To see how to create a new API Key, you can ' +
        'check out Rapid7 Documentation (https://docs.rapid7.com/insight/managing-platform-api-keys/). ' +
        'In order to Assign Users to Investigations, your API Key must have Organization ' +
        'Admin level or above permissions.  If your key is at the User level, Assigning Users to Investigations will be disabled.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'regionCode',
      name: 'Rapid7 Region Code',
      description:
        "The API Region Code that will be used to search Rapid7's API. To check your data " +
        'region, you can check out Rapid7 Documentation (https://docs.rapid7.com/insight/navigate-the-insight-platform/#check-your-data-region).',
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
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'opCode',
      name: 'Op Code',
      description:
        'The alpha-numeric op code from the search app URL which can be found as "https://<region>.idr.insight.rapid7.com/op/{code}".  The `op code` value should not include the trailing `#`.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'logQuery',
      name: 'Log Search Query',
      description:
        'The query you want to run when searching Rapid7 Log Data. The query follows the ' +
        'LEQL querying format (https://docs.rapid7.com/insightidr/build-a-query/#log-entry-query-language-leql), ' +
        'and must contain the variable "{{ENTITY}}" in order for the search to be executed properly.  ' +
        'The variable represented by the string "{{ENTITY}}" will be replaced by the actual entity ' +
        "(i.e., an IP, hash, or email) that Polarity recognized on the user's screen. For " +
        'example, the default query is "where({{ENTITY}})" which searches for any place in ' +
        'the logs where the entity appears.',
      default: 'where({{ENTITY}})',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'logset',
      name: 'Log Sets to Query',
      description:
        'A comma delimited list of log sets you wish to query.  Log set names are case sensitive.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'logQueryTimeRange',
      name: 'Log Query Time Range',
      description:
        'The amount of time back you would like to see logs from. Supported values include: ' +
        '"yesterday", "today", and "last x timeunits" where x is the number of time unit ' +
        'back from the current server time. (Supported time units (case insensitive): ' +
        'min(s) or minute(s), hr(s) or hour(s), day(s), week(s), month(s), or year(s)). For external links to work specify time in days (e.g., "last 360 days" instead of "last 1 year")',
      default: 'last 30 days',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'documentTitleField',
      name: 'Document Title Field',
      description:
        '"message" field to use as the title for each returned document in the details template.  This field must be returned by your log query. If left blank, the log id will be used. This option should be set to "Users can view only".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: false
    },
    {
      key: 'summaryFields',
      name: 'Summary Fields',
      description:
        'Comma delimited list of field names to include as part of the summary tags.  JSON dot notation can be used to target nested attributes starting inside the "message" object. Fields must be returned by your search query to be displayed.  You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>").  If left blank, a result count will be shown. This option should be set to "Only Admins can View and Edit".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'displayFields',
      name: 'Display Fields',
      description:
        'Comma delimited list of field names to include as part of the details block.  JSON dot notation can be used to target nested attributes starting inside the "message" object. Fields must be returned by your search query to be displayed.  You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>").  If left blank, no fields tab will be shown. This option should be set to "Only Admins can View and Edit".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'maxResults',
      name: 'Max Log Results Shown',
      description: 'The maximum number of log search results',
      default: 20,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'showNoResults',
      name: 'Show No Results',
      description:
        'If checked, the integration will return a message indicating there were no search results. Note that `calculate` queries always return a result regardless of this setting.',
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
