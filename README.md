# Polarity Nexpose Insight IDR Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

The Polarity Nexpose Insight IDR Integration allows you to easily Query Emails, IP Addresses, Domains, and URLs in both Investigations, and Query Logs. You can also add Indicators to Threats, Close Investigations, and Assign Users to Investigations.

<!-- TODO: Add image -->

To learn more about Nexpose Insight IDR, visit the [official website](https://docs.rapid7.com/insightidr/).


## Nexpose Insight IDR Integration Options

### Nexpose Insight IDR API Key
Your API key for Nexpose Insight IDR. To see how to create a new API Key, you can [View Nexpose's Documentation](https://docs.rapid7.com/insight/managing-platform-api-keys/). In order to Assign Users to Investigations, your API Key must have Organization Admin level or above permissions.  

> ***NOTE:*** If your key is at the User level, Assigning Users to Investigations will be disabled.

### Nexpose Region Code
The API Region Code that will be used to search Nexpose's API. To check your data region, you can [View Nexpose's Documentation](https://docs.rapid7.com/insight/navigate-the-insight-platform/#check-your-data-region).

### Log Search Query
The query you want to run when searching Nexpose Log Data. The query follows the [LEQL querying format](https://docs.rapid7.com/insightidr/build-a-query/#log-entry-query-language-leql), and must contain the variable `{{ENTITY}}` in order for the search to be executed properly.  The variable represented by the string `{{ENTITY}}` will be replaced by the actual entity (i.e., an IP, hash, or email) that Polarity recognized on the user's screen. For example, the default query is `where({{ENTITY}})` which searches for any place in the logs where the entity appears.

### Log Query Time Range
The amount of time back you would like to see logs from. Supported values include: 
- `yesterday`
- `today`
- `last x timeunits` where x is the number of time unit back from the current server time. Supported time units (case insensitive): 
   -  min(s) or minute(s)
   -  hr(s) or hour(s)
   -  day(s)
   -  week(s)
   -  month(s)
   -  year(s).


### Threats To add Indicators To
This is a comma separated list of Threats you will be able to add entities/indicators to.  The format to use is `Threat Name 1->threat-key-uuid-1, Threat Name 2->threat-uuid-2` (e.g. `MP Threat->832f42d1-9247-4e35-b521-f815d84e0df0, ...`). 

[View Documentation](https://docs.rapid7.com/insightidr/threats/) for more details on how to get your Threat Key UUIDs.

>***NOTE:*** If left blank, adding an indicator to threats will be disabled.

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).


## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
