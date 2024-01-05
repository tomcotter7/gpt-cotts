source vars.sh

sudo apt-get update

sudo apt-get install -y nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

sudo apt-get install -y python3 python3-pip python3-venv

sudo npm install -g pm2

