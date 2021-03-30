node -v
cd ./tools/build-prepare
npm install --registry=https://registry.npm.taobao.org --save-dev
cd ../../
echo "PWD:"$PWD
node ./tools/build-prepare/bin.buildPrepare.js "$@"
