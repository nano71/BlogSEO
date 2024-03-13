fuser -k 9001/tcp
rm -rf ./nohup.out
nohup node ./server.js &
