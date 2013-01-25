
index.html: lib/connect-dynamodb.js
	dox \
		--title "Connect DynamoDB" \
		--desc "DynamoDB session store for connect backed by [aws-sdk](http://aws.amazon.com/sdkfornodejs/)." \
		--ribbon "http://github.com/ca98am79/connect-dynamodb" \
		$< > $@
