# Set default goal to 'all' target
.DEFAULT_GOAL := all
JS_FINAL = js/main.js
JS_TARGETS = js/*.js

# Setup phony targets
.PHONY: all

all: $(JS_FINAL)

$(JS_FINAL):
	cat js/*.js >> $(JS_FINAL)

clean:
	rm -f $(JS_FINAL)
