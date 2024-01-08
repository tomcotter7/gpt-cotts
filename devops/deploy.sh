source vars.sh

ssh-add $SSH_KEY_PATH

rsync -av ../gpt-cotts-fastapi/ $USER@$HOST:~/gpt-cotts-fastapi  --exclude=venv

ssh $USER@$HOST "
  cd ~/gpt-cotts-fastapi
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt --no-cache-dir
  pm2 delete gpt-cotts-fastapi
  pm2 start 'gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:rag' --name gpt-cotts-fastapi
"

rsync -av ../gpt-cotts-frontend/ $USER@$HOST:~/gpt-cotts-frontend --exclude=node_modules --exclude=.next --exclude=.env.local

ssh $USER@$HOST "
  cd ~/gpt-cotts-frontend
  npm install
  npm run build
  pm2 delete gpt-cotts-frontend
  pm2 start 'npm run start' --name gpt-cotts-frontend
"

cp default.template.conf default.conf
sed -i "s/{HOST}/$DOMAIN/g" default.conf
scp default.conf $USER@$HOST:
ssh $USER@$HOST "
  sudo cp default.conf /etc/nginx/conf.d
  sudo nginx -s reload
"

ssh $USER@$HOST "pm2 save"
