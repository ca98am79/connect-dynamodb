2.0.4 / 2019-11-15

  * Don't crash on invalid session data stored in DDB (https://github.com/ca98am79/connect-dynamodb/issues/44)

2.0.3 / 2019-01-02

  * Support passing express-session directly to the adapter (https://github.com/ca98am79/connect-dynamodb/issues/54)

2.0.2 / 2018-09-12

  * fix to use the hashKey provided in config

2.0.1 / 2018-07-07

  * Make possible to use npm install --no-optional

2.0.0 / 2017-08-19
==================

  * 1.0.12 had breaking change with dates

1.0.12 / 2017-07-03
==================

  * Implemented touch as requested on #23 and changed the expires field to work on seconds units instead of millis to address #39. This way to use TTL we just need to enable it on the table and select the 'expires' field. (https://github.com/ca98am79/connect-dynamodb/pull/43)

1.0.11 / 2017-03-14
==================

  * Configurable ProvisionedThroughput read/write capacity units (https://github.com/ca98am79/connect-dynamodb/pull/40)

1.0.10 / 2017-02-27
==================

  * Set Consistent read by default (https://github.com/ca98am79/connect-dynamodb/pull/37)

1.0.9 / 2016-08-21
==================

  * Fix bug with reap method (https://github.com/ca98am79/connect-dynamodb/issues/33)

1.0.8 / 2016-07-18
==================

  * Fix issue with reap method (https://github.com/ca98am79/connect-dynamodb/issues/27)

1.0.7 / 2016-01-29
==================

  * Add ability to provide a JSON object to configure AWS, specify custom hashKey (https://github.com/ca98am79/connect-dynamodb/pull/26)

1.0.6 / 2014-01-29
==================

  * bug fix (https://github.com/ca98am79/connect-dynamodb/issues/16)

1.0.5 / 2014-01-28
==================

  * Change to allow loading of AWS credentials from environment vars (https://github.com/ca98am79/connect-dynamodb/issues/15)

1.0.4 / 2013-07-27
==================

  * Fix for default table name (https://github.com/ca98am79/connect-dynamodb/issues/13)

1.0.3 / 2013-08-10
==================

  * Change tests to should.js

1.0.2 / 2013-07-27
==================

  * Properly handle errors in get (https://github.com/ca98am79/connect-dynamodb/issues/12)

1.0.1 / 2013-06-27
==================

  * Change expires check to a number (https://github.com/ca98am79/connect-dynamodb/issues/11)

1.0.0 / 2013-05-25
==================

  * Adding support for the 2012-08-10 API version of DynamoDB (https://github.com/ca98am79/connect-dynamodb/issues/6)

0.1.4 / 2013-04-19
==================

  * Specify API version because of breaking updates to aws-sdk-js (http://aws.amazon.com/releasenotes/JavaScript/3118686131819314)

0.1.3 / 2013-04-11
==================

  * Fix expiry default if no sess.cookie.maxAge (https://github.com/ca98am79/connect-dynamodb/issues/4)

0.1.2 / 2013-04-06
==================

  * Fixed reap issue (https://github.com/ca98am79/connect-dynamodb/issues/3)

0.1.1 / 2013-01-26
==================

  * Cleanup of tests 

0.1.0 / 2013-01-25
==================

  * Switch to use aws-sdk instead of dynode
  
0.0.6 / 2012-06-29
==================

  * Fix an error with dynode 0.5.0
  
0.0.5 / 2012-06-13
==================

  * Added session table check/creation at init

0.0.2 / 2012-05-23
==================

  * Added reap deletion of expired sessions
  
0.0.1 / 2012-05-21
==================

  * Initial commit
