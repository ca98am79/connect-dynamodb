
index.html: lib/connect-dynamodb.js
	dox \
		--title "Connect DynamoDB" \
		--desc "DynamoDB session store for connect backed by [dynode](https://github.com/Wantworthy/dynode)." \
		--ribbon "http://github.com/ca98am79/connect-dynamodb" \
		$< > $@
