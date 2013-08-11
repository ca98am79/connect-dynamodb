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
