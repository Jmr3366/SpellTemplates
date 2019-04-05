# Set default goal to 'all' target
.DEFAULT_GOAL := all
JS_FINAL = js/main.js
JS_MIN = js/main.min.js
JS_TARGETS = js/*.js

# Setup phony targets
.PHONY: all

all: $(JS_FINAL)

$(JS_FINAL):
	cat js/*.js >> $(JS_FINAL)
#   https://github.com/tdewolff/minify/tree/master/cmd/minify
	~/go/bin/minify js/main.js -o $(JS_MIN)

clean:
	rm -f $(JS_FINAL)
	rm -f $(JS_MIN)
