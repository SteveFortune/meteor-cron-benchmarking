export MONGO_URL=$1
echo "Worker processing $1, on port $2"
meteor --port=$2
