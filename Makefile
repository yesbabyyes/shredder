PATH := ./node_modules/.bin:${PATH}

init:
	npm install --dev

docs:
	docco src/*.coffee

clean-docs:
	rm -rf docs/

clean: clean-docs
	rm -rf lib/ tests/*.js

build:
	coffee -o lib/ -c src/ && coffee -c tests/shredder.coffee

test:
	nodeunit tests/shredder.js

dist: clean init docs build test
